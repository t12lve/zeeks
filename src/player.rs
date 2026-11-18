//! Aperçu audio avant génération : lecture du PCM décodé via `waveOut` (winmm).
//! Aucune dépendance externe, pas de thread : on alimente quelques tampons et on
//! interroge la position du périphérique pour déplacer la tête de lecture.

use std::sync::Arc;

use anyhow::{bail, Result};
use windows::core::PSTR;
use windows::Win32::Media::Audio::{
    waveOutGetPosition, waveOutOpen, waveOutPrepareHeader, waveOutReset, waveOutUnprepareHeader,
    waveOutWrite, HWAVEOUT, WAVEHDR, WAVE_FORMAT_PCM, WAVE_MAPPER, CALLBACK_NULL, WHDR_DONE,
};
use windows::Win32::Media::{MMTIME, TIME_BYTES, TIME_MS, TIME_SAMPLES};

use crate::mf::{AudioPcm, AUDIO_CHANNELS, AUDIO_RATE};

/// Taille d'un tampon : ~85 ms.
const CHUNK_FRAMES: usize = 4096;
/// Nombre de tampons en file : ~340 ms d'avance.
const BUFFERS: usize = 4;
const BLOCK_ALIGN: usize = AUDIO_CHANNELS as usize * 2;

#[derive(Clone, Copy, PartialEq, Eq)]
enum State {
    Stopped,
    Playing,
    Paused,
}

struct Slot {
    header: Box<WAVEHDR>,
    data: Vec<u8>,
    prepared: bool,
    /// Déjà envoyé au périphérique au moins une fois.
    submitted: bool,
}

pub struct Player {
    device: HWAVEOUT,
    pcm: Arc<AudioPcm>,
    total_frames: usize,
    /// Première image de la lecture en cours (position du dernier `waveOutReset`).
    origin: usize,
    /// Prochaine image à mettre en file.
    queued: usize,
    /// Position mémorisée entre deux lectures.
    resume_at: usize,
    state: State,
    slots: Vec<Slot>,
}

impl Player {
    pub fn new(pcm: Arc<AudioPcm>) -> Result<Self> {
        let total_frames = pcm.frames();
        if total_frames == 0 {
            bail!("Aucun échantillon à lire.");
        }
        let format = windows::Win32::Media::Audio::WAVEFORMATEX {
            wFormatTag: WAVE_FORMAT_PCM as u16,
            nChannels: AUDIO_CHANNELS as u16,
            nSamplesPerSec: AUDIO_RATE,
            nAvgBytesPerSec: AUDIO_RATE * BLOCK_ALIGN as u32,
            nBlockAlign: BLOCK_ALIGN as u16,
            wBitsPerSample: 16,
            cbSize: 0,
        };

        unsafe {
            let mut device = HWAVEOUT::default();
            let code = waveOutOpen(
                Some(&mut device),
                WAVE_MAPPER,
                &format,
                Some(0),
                Some(0),
                CALLBACK_NULL,
            );
            if code != 0 || device.is_invalid() {
                bail!("Périphérique audio indisponible (code {code}).");
            }

            let mut slots: Vec<Slot> = Vec::with_capacity(BUFFERS);
            for _ in 0..BUFFERS {
                let mut header = Box::new(WAVEHDR {
                    dwBufferLength: (CHUNK_FRAMES * BLOCK_ALIGN) as u32,
                    ..Default::default()
                });
                let mut data = vec![0u8; CHUNK_FRAMES * BLOCK_ALIGN];
                header.lpData = PSTR::from_raw(data.as_mut_ptr());
                if waveOutPrepareHeader(device, &mut *header, size_of::<WAVEHDR>() as u32) != 0 {
                    for slot in &mut slots {
                        let _ = waveOutUnprepareHeader(
                            device,
                            &mut *slot.header,
                            size_of::<WAVEHDR>() as u32,
                        );
                    }
                    let _ = windows::Win32::Media::Audio::waveOutClose(device);
                    bail!("Préparation du tampon audio impossible.");
                }
                slots.push(Slot {
                    header,
                    data,
                    prepared: true,
                    submitted: false,
                });
            }

            Ok(Self {
                device,
                pcm,
                total_frames,
                origin: 0,
                queued: 0,
                resume_at: 0,
                state: State::Stopped,
                slots,
            })
        }
    }

    pub fn duration(&self) -> f64 {
        self.total_frames as f64 / AUDIO_RATE as f64
    }

    pub fn is_playing(&self) -> bool {
        self.state == State::Playing
    }

    /// Position courante en frames (échantillons par canal).
    pub fn current_frame(&self) -> usize {
        let frames = match self.state {
            State::Playing => self.origin + self.played_frames(),
            State::Paused => self.resume_at,
            State::Stopped => 0,
        };
        frames.min(self.total_frames)
    }

    /// Niveaux stéréo dynamiques (G / D) pour le VU-mètre.
    pub fn levels(&self, window_frames: usize) -> crate::mf::StereoLevels {
        if self.state != State::Playing {
            return crate::mf::StereoLevels {
                left_db: -60.0,
                right_db: -60.0,
                ..Default::default()
            };
        }
        let frame = self.current_frame();
        self.pcm.calculate_levels(frame, window_frames)
    }

    /// Position courante en secondes.
    pub fn position(&self) -> f64 {
        (self.current_frame() as f64 / AUDIO_RATE as f64).min(self.duration())
    }

    pub fn toggle(&mut self) {
        match self.state {
            State::Playing => {
                self.resume_at = (self.origin + self.played_frames()).min(self.total_frames);
                self.stop_device();
                self.state = State::Paused;
            }
            _ => {
                let start = if self.resume_at >= self.total_frames {
                    0
                } else {
                    self.resume_at
                };
                self.start_at(start);
            }
        }
    }

    pub fn seek(&mut self, seconds: f64) {
        let frame = (seconds.max(0.0) * AUDIO_RATE as f64) as usize;
        let frame = frame.min(self.total_frames.saturating_sub(1));
        if self.state == State::Playing {
            self.start_at(frame);
        } else {
            self.resume_at = frame;
            if self.state == State::Stopped {
                self.state = State::Paused;
            }
        }
    }

    pub fn stop(&mut self) {
        self.stop_device();
        self.resume_at = 0;
        self.state = State::Stopped;
    }

    /// À appeler régulièrement (par image d'interface) pour alimenter la file.
    pub fn poll(&mut self) {
        if self.state != State::Playing {
            return;
        }
        self.fill();

        // fin de lecture : tout est écrit et tous les tampons sont terminés
        if self.queued >= self.total_frames && self.slots.iter().all(|s| s.finished()) {
            self.stop_device();
            self.resume_at = 0;
            self.state = State::Stopped;
        }
    }

    fn start_at(&mut self, frame: usize) {
        self.stop_device();
        self.origin = frame;
        self.queued = frame;
        self.state = State::Playing;
        self.fill();
    }

    fn fill(&mut self) {
        for i in 0..self.slots.len() {
            if !self.slots[i].finished() {
                continue;
            }
            if self.queued >= self.total_frames {
                break;
            }
            let frames = CHUNK_FRAMES.min(self.total_frames - self.queued);
            let bytes = frames * BLOCK_ALIGN;
            {
                let slot = &mut self.slots[i];
                let src = &self.pcm.samples[self.queued * AUDIO_CHANNELS as usize
                    ..(self.queued + frames) * AUDIO_CHANNELS as usize];
                let raw =
                    unsafe { std::slice::from_raw_parts(src.as_ptr().cast::<u8>(), bytes) };
                slot.data[..bytes].copy_from_slice(raw);
                for b in &mut slot.data[bytes..] {
                    *b = 0; // silence : la taille du tampon reste constante
                }
                // on garde WHDR_PREPARED, on ne retire que WHDR_DONE
                slot.header.dwFlags &= !WHDR_DONE;
                slot.header.lpData = PSTR::from_raw(slot.data.as_mut_ptr());
                slot.header.dwBufferLength = slot.data.len() as u32;
            }
            let slot = &mut self.slots[i];
            unsafe {
                if waveOutWrite(self.device, &mut *slot.header, size_of::<WAVEHDR>() as u32) != 0 {
                    self.state = State::Stopped;
                    return;
                }
            }
            self.slots[i].submitted = true;
            self.queued += frames;
        }
    }

    fn stop_device(&mut self) {
        unsafe {
            waveOutReset(self.device);
        }
    }

    fn played_frames(&self) -> usize {
        let mut time = MMTIME {
            wType: TIME_BYTES,
            ..Default::default()
        };
        unsafe {
            if waveOutGetPosition(self.device, &mut time, size_of::<MMTIME>() as u32) != 0 {
                return 0;
            }
            let bytes = match time.wType {
                TIME_BYTES => time.u.cb as usize,
                TIME_SAMPLES => time.u.sample as usize * BLOCK_ALIGN,
                TIME_MS => {
                    (time.u.ms as usize) * AUDIO_RATE as usize / 1000 * BLOCK_ALIGN
                }
                _ => 0,
            };
            bytes / BLOCK_ALIGN
        }
    }
}

impl Slot {
    /// Un tampon est réutilisable s'il n'a jamais été envoyé ou n'est plus en cours de lecture.
    fn finished(&self) -> bool {
        !self.submitted || self.header.dwFlags & WHDR_DONE != 0
    }
}

impl Drop for Player {
    fn drop(&mut self) {
        unsafe {
            waveOutReset(self.device);
            for slot in &mut self.slots {
                if slot.prepared {
                    let _ = waveOutUnprepareHeader(
                        self.device,
                        &mut *slot.header,
                        size_of::<WAVEHDR>() as u32,
                    );
                }
            }
            let _ = windows::Win32::Media::Audio::waveOutClose(self.device);
        }
    }
}
