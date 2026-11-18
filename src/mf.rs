//! Accès à Media Foundation : décodage audio (MP3/WAV/…), lecture de clips vidéo,
//! et écriture d'un MP4 (H.264 + AAC). Aucune dépendance externe : API Windows.

use std::path::Path;
use std::slice;
use std::sync::Mutex;

use anyhow::{bail, Context, Result};
use windows::core::{HSTRING, Interface};
use windows::Win32::Media::MediaFoundation::*;
use windows::Win32::System::Com::{CoInitializeEx, COINIT_MULTITHREADED};

use crate::visual::Frame;

const ALL_STREAMS: u32 = 0xFFFF_FFFE;
const FIRST_AUDIO: u32 = 0xFFFF_FFFD;
const FIRST_VIDEO: u32 = 0xFFFF_FFFC;
const ENDOFSTREAM: u32 = 0x0000_0002;
const INVALID_MEDIA_TYPE: u32 = 0x0000_0008;
const CURRENT_MEDIA_TYPE_CHANGED: u32 = 0x0000_0001;

pub const AUDIO_RATE: u32 = 48_000;
pub const AUDIO_CHANNELS: u32 = 2;
pub const TICKS: i64 = 10_000_000; // unité de temps Media Foundation (100 ns)

static MF_STATUS: Mutex<Option<Result<(), String>>> = Mutex::new(None);

/// Initialise COM (pour le thread courant) + Media Foundation (une fois par process).
pub fn ensure() -> Result<()> {
    unsafe {
        // RPC_E_CHANGED_MODE (COM déjà initialisé autrement) est sans conséquence ici.
        let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
    }
    let mut status = MF_STATUS.lock().unwrap();
    if status.is_none() {
        let r = unsafe { MFStartup(MF_VERSION, MFSTARTUP_FULL) }.map_err(|e| e.to_string());
        *status = Some(r);
    }
    match status.as_ref().unwrap() {
        Ok(()) => Ok(()),
        Err(e) => bail!("Media Foundation indisponible : {e}"),
    }
}

fn wide(path: &Path) -> HSTRING {
    HSTRING::from(path.to_string_lossy().as_ref())
}

fn set_pair(t: &IMFMediaType, key: &windows::core::GUID, hi: u32, lo: u32) -> Result<()> {
    unsafe { t.SetUINT64(key, ((hi as u64) << 32) | lo as u64) }.map_err(Into::into)
}

// ---------------------------------------------------------------------------
// Audio
// ---------------------------------------------------------------------------

#[derive(Clone, Copy, Debug, Default)]
pub struct StereoLevels {
    pub left_rms: f32,
    pub right_rms: f32,
    pub left_peak: f32,
    pub right_peak: f32,
    pub left_db: f32,
    pub right_db: f32,
}

pub struct AudioPcm {
    /// Échantillons entrelacés stéréo 16 bits à 48 kHz.
    pub samples: Vec<i16>,
}

impl AudioPcm {
    pub fn duration(&self) -> f64 {
        self.samples.len() as f64 / (AUDIO_CHANNELS as f64 * AUDIO_RATE as f64)
    }
    pub fn frames(&self) -> usize {
        self.samples.len() / AUDIO_CHANNELS as usize
    }

    /// Calcule les niveaux RMS, crête et dB pour les canaux Gauche et Droite
    /// sur une fenêtre de frames donnée autour de `frame_idx`.
    pub fn calculate_levels(&self, frame_idx: usize, window_frames: usize) -> StereoLevels {
        let total = self.frames();
        if total == 0 || frame_idx >= total || window_frames == 0 {
            return StereoLevels {
                left_db: -60.0,
                right_db: -60.0,
                ..Default::default()
            };
        }
        let end_frame = (frame_idx + window_frames).min(total);
        let count = end_frame - frame_idx;
        if count == 0 {
            return StereoLevels {
                left_db: -60.0,
                right_db: -60.0,
                ..Default::default()
            };
        }

        let start_sample = frame_idx * AUDIO_CHANNELS as usize;
        let end_sample = end_frame * AUDIO_CHANNELS as usize;
        let slice = &self.samples[start_sample..end_sample];

        let mut sum_sq_l = 0.0f64;
        let mut sum_sq_r = 0.0f64;
        let mut peak_l = 0.0f32;
        let mut peak_r = 0.0f32;

        for chunk in slice.chunks_exact(2) {
            let l = chunk[0] as f32 / 32768.0;
            let r = chunk[1] as f32 / 32768.0;

            let abs_l = l.abs();
            let abs_r = r.abs();
            if abs_l > peak_l {
                peak_l = abs_l;
            }
            if abs_r > peak_r {
                peak_r = abs_r;
            }

            sum_sq_l += (l * l) as f64;
            sum_sq_r += (r * r) as f64;
        }

        let rms_l = (sum_sq_l / count as f64).sqrt() as f32;
        let rms_r = (sum_sq_r / count as f64).sqrt() as f32;

        fn to_db(lin: f32) -> f32 {
            if lin <= 0.0001 {
                -60.0
            } else {
                (20.0 * lin.log10()).max(-60.0)
            }
        }

        StereoLevels {
            left_rms: rms_l.clamp(0.0, 1.0),
            right_rms: rms_r.clamp(0.0, 1.0),
            left_peak: peak_l.clamp(0.0, 1.0),
            right_peak: peak_r.clamp(0.0, 1.0),
            left_db: to_db(rms_l),
            right_db: to_db(rms_r),
        }
    }
}

/// Décode n'importe quel fichier audio lisible par Windows en PCM 48 kHz stéréo.
pub fn decode_audio(path: &Path) -> Result<AudioPcm> {
    ensure()?;
    unsafe {
        let reader = MFCreateSourceReaderFromURL(&wide(path), None)
            .with_context(|| format!("Fichier audio illisible : {}", path.display()))?;
        reader.SetStreamSelection(ALL_STREAMS, false)?;
        if reader.SetStreamSelection(FIRST_AUDIO, true).is_err() {
            bail!("Ce fichier ne contient aucune piste audio.");
        }

        let out = MFCreateMediaType()?;
        out.SetGUID(&MF_MT_MAJOR_TYPE, &MFMediaType_Audio)?;
        out.SetGUID(&MF_MT_SUBTYPE, &MFAudioFormat_PCM)?;
        out.SetUINT32(&MF_MT_AUDIO_BITS_PER_SAMPLE, 16)?;
        out.SetUINT32(&MF_MT_AUDIO_SAMPLES_PER_SECOND, AUDIO_RATE)?;
        out.SetUINT32(&MF_MT_AUDIO_NUM_CHANNELS, AUDIO_CHANNELS)?;
        out.SetUINT32(&MF_MT_AUDIO_BLOCK_ALIGNMENT, 4)?;
        out.SetUINT32(&MF_MT_AUDIO_AVG_BYTES_PER_SECOND, AUDIO_RATE * 4)?;
        reader
            .SetCurrentMediaType(FIRST_AUDIO, None, &out)
            .context("Le décodeur audio de Windows ne prend pas ce fichier en charge.")?;

        let mut pcm: Vec<i16> = Vec::new();
        loop {
            let mut flags = 0u32;
            let mut sample: Option<IMFSample> = None;
            reader.ReadSample(
                FIRST_AUDIO,
                0,
                None,
                Some(&mut flags),
                None,
                Some(&mut sample),
            )?;
            if flags & ENDOFSTREAM != 0 {
                break;
            }
            if let Some(s) = sample {
                let buf = s.ConvertToContiguousBuffer()?;
                let mut p: *mut u8 = std::ptr::null_mut();
                let mut len = 0u32;
                buf.Lock(&mut p, None, Some(&mut len))?;
                let bytes = slice::from_raw_parts(p, len as usize);
                let n = bytes.len() / 2;
                let mut chunk = vec![0i16; n];
                std::ptr::copy_nonoverlapping(bytes.as_ptr(), chunk.as_mut_ptr() as *mut u8, n * 2);
                pcm.extend_from_slice(&chunk);
                buf.Unlock()?;
            }
        }
        if pcm.is_empty() {
            bail!("Aucun son n'a pu être décodé depuis ce fichier.");
        }
        Ok(AudioPcm { samples: pcm })
    }
}

// ---------------------------------------------------------------------------
// Écriture MP4
// ---------------------------------------------------------------------------

fn create_sample(data: &[u8]) -> Result<IMFSample> {
    unsafe {
        let buf = MFCreateMemoryBuffer(data.len() as u32)?;
        let mut p: *mut u8 = std::ptr::null_mut();
        buf.Lock(&mut p, None, None)?;
        if !data.is_empty() {
            std::ptr::copy_nonoverlapping(data.as_ptr(), p, data.len());
        }
        buf.Unlock()?;
        buf.SetCurrentLength(data.len() as u32)?;
        let sample = MFCreateSample()?;
        sample.AddBuffer(&buf)?;
        Ok(sample)
    }
}

pub struct Mp4Writer {
    writer: IMFSinkWriter,
    video_stream: u32,
    audio_stream: u32,
}

impl Mp4Writer {
    pub fn new(
        path: &Path,
        width: u32,
        height: u32,
        fps: u32,
        video_bps: u32,
    ) -> Result<Self> {
        ensure()?;
        unsafe {
            let mut attrs: Option<IMFAttributes> = None;
            MFCreateAttributes(&mut attrs, 3)?;
            let attrs = attrs.unwrap();
            attrs.SetUINT32(&MF_SINK_WRITER_DISABLE_THROTTLING, 1)?;
            attrs.SetUINT32(&MF_READWRITE_ENABLE_HARDWARE_TRANSFORMS, 1)?;

            let writer = MFCreateSinkWriterFromURL(&wide(path), None, &attrs)
                .with_context(|| format!("Impossible de créer {}", path.display()))?;

            // --- piste vidéo (sortie H.264) ---
            let vout = MFCreateMediaType()?;
            vout.SetGUID(&MF_MT_MAJOR_TYPE, &MFMediaType_Video)?;
            vout.SetGUID(&MF_MT_SUBTYPE, &MFVideoFormat_H264)?;
            vout.SetUINT32(&MF_MT_AVG_BITRATE, video_bps)?;
            vout.SetUINT32(&MF_MT_INTERLACE_MODE, 2)?; // progressif
            vout.SetUINT32(&MF_MT_MPEG2_PROFILE, eAVEncH264VProfile_High.0 as u32)?;
            vout.SetUINT32(&MF_MT_VIDEO_PRIMARIES, 2)?; // BT.709
            vout.SetUINT32(&MF_MT_TRANSFER_FUNCTION, 2)?;
            vout.SetUINT32(&MF_MT_YUV_MATRIX, 2)?;
            vout.SetUINT32(&MF_MT_VIDEO_NOMINAL_RANGE, 1)?; // 16-235
            set_pair(&vout, &MF_MT_FRAME_SIZE, width, height)?;
            set_pair(&vout, &MF_MT_FRAME_RATE, fps, 1)?;
            set_pair(&vout, &MF_MT_PIXEL_ASPECT_RATIO, 1, 1)?;
            let video_stream = writer.AddStream(&vout).context("Encodage H.264 refusé")?;

            let vin = MFCreateMediaType()?;
            vin.SetGUID(&MF_MT_MAJOR_TYPE, &MFMediaType_Video)?;
            vin.SetGUID(&MF_MT_SUBTYPE, &MFVideoFormat_NV12)?;
            vin.SetUINT32(&MF_MT_INTERLACE_MODE, 2)?;
            set_pair(&vin, &MF_MT_FRAME_SIZE, width, height)?;
            set_pair(&vin, &MF_MT_FRAME_RATE, fps, 1)?;
            set_pair(&vin, &MF_MT_PIXEL_ASPECT_RATIO, 1, 1)?;
            writer.SetInputMediaType(video_stream, &vin, None)?;

            // --- piste audio (sortie AAC) ---
            let aout = MFCreateMediaType()?;
            aout.SetGUID(&MF_MT_MAJOR_TYPE, &MFMediaType_Audio)?;
            aout.SetGUID(&MF_MT_SUBTYPE, &MFAudioFormat_AAC)?;
            aout.SetUINT32(&MF_MT_AUDIO_BITS_PER_SAMPLE, 16)?;
            aout.SetUINT32(&MF_MT_AUDIO_SAMPLES_PER_SECOND, AUDIO_RATE)?;
            aout.SetUINT32(&MF_MT_AUDIO_NUM_CHANNELS, AUDIO_CHANNELS)?;
            aout.SetUINT32(&MF_MT_AUDIO_AVG_BYTES_PER_SECOND, 24_000)?; // 192 kb/s
            aout.SetUINT32(&MF_MT_AAC_PAYLOAD_TYPE, 0)?;
            aout.SetUINT32(&MF_MT_AAC_AUDIO_PROFILE_LEVEL_INDICATION, 0x29)?;
            let audio_stream = writer.AddStream(&aout).context("Encodage AAC refusé")?;

            let ain = MFCreateMediaType()?;
            ain.SetGUID(&MF_MT_MAJOR_TYPE, &MFMediaType_Audio)?;
            ain.SetGUID(&MF_MT_SUBTYPE, &MFAudioFormat_PCM)?;
            ain.SetUINT32(&MF_MT_AUDIO_BITS_PER_SAMPLE, 16)?;
            ain.SetUINT32(&MF_MT_AUDIO_SAMPLES_PER_SECOND, AUDIO_RATE)?;
            ain.SetUINT32(&MF_MT_AUDIO_NUM_CHANNELS, AUDIO_CHANNELS)?;
            ain.SetUINT32(&MF_MT_AUDIO_BLOCK_ALIGNMENT, 4)?;
            ain.SetUINT32(&MF_MT_AUDIO_AVG_BYTES_PER_SECOND, AUDIO_RATE * 4)?;
            ain.SetUINT32(&MF_MT_ALL_SAMPLES_INDEPENDENT, 1)?;
            writer.SetInputMediaType(audio_stream, &ain, None)?;

            writer.BeginWriting()?;
            Ok(Self {
                writer,
                video_stream,
                audio_stream,
            })
        }
    }

    /// `nv12` doit contenir exactement la taille de la piste (w*h*3/2).
    pub fn write_video(&self, nv12: &[u8], t: i64, dur: i64) -> Result<()> {
        let sample = create_sample(nv12)?;
        unsafe {
            sample.SetSampleTime(t)?;
            sample.SetSampleDuration(dur)?;
            self.writer.WriteSample(self.video_stream, &sample)?;
        }
        Ok(())
    }

    pub fn write_audio(&self, pcm: &[i16], t: i64, frames: u32) -> Result<()> {
        if frames == 0 {
            return Ok(());
        }
        let bytes: &[u8] =
            unsafe { slice::from_raw_parts(pcm.as_ptr() as *const u8, frames as usize * 4) };
        let sample = create_sample(bytes)?;
        unsafe {
            sample.SetSampleTime(t)?;
            sample.SetSampleDuration(frames as i64 * TICKS / AUDIO_RATE as i64)?;
            self.writer.WriteSample(self.audio_stream, &sample)?;
        }
        Ok(())
    }

    pub fn finish(&self) -> Result<()> {
        unsafe { self.writer.Finalize() }.context("Finalisation du MP4 impossible")
    }
}

// ---------------------------------------------------------------------------
// Lecture d'un clip vidéo (fond animé) : images RGB à la demande
// ---------------------------------------------------------------------------

pub struct VideoSource {
    reader: IMFSourceReader,
    path: HSTRING,
    pub width: u32,
    pub height: u32,
    /// Durée d'une image source (100 ns), utilisée pour le rythme.
    frame_dur: i64,
    current: Frame,
    current_time: i64,
    /// Décalage cumulé des boucles du clip (pour garder une ligne de temps continue).
    loop_offset: i64,
    eos: bool,
    scratch: Vec<u8>,
}

impl VideoSource {
    pub fn open(path: &Path) -> Result<Self> {
        ensure()?;
        unsafe {
            let reader = open_video_reader(&wide(path))
                .with_context(|| format!("Vidéo illisible : {}", path.display()))?;

            let native = reader.GetNativeMediaType(FIRST_VIDEO, 0)?;
            let size = native.GetUINT64(&MF_MT_FRAME_SIZE).unwrap_or(0);
            let (mut width, mut height) = ((size >> 32) as u32, size as u32);
            let fps_pair = native.GetUINT64(&MF_MT_FRAME_RATE).unwrap_or(0);
            let (mut num, mut den) = ((fps_pair >> 32) as u32, fps_pair as u32);
            if width == 0 || height == 0 {
                width = 1280;
                height = 720;
            }
            if num == 0 || den == 0 {
                num = 30;
                den = 1;
            }
            let frame_dur = (TICKS * den as i64) / num as i64;

            let out = MFCreateMediaType()?;
            out.SetGUID(&MF_MT_MAJOR_TYPE, &MFMediaType_Video)?;
            out.SetGUID(&MF_MT_SUBTYPE, &MFVideoFormat_RGB32)?;
            out.SetUINT32(&MF_MT_INTERLACE_MODE, 2)?;
            set_pair(&out, &MF_MT_FRAME_SIZE, width, height)?;
            set_pair(&out, &MF_MT_PIXEL_ASPECT_RATIO, 1, 1)?;
            reader
                .SetCurrentMediaType(FIRST_VIDEO, None, &out)
                .context("Décodage vidéo impossible (codec non pris en charge par Windows)")?;

            let mut me = Self {
                reader,
                path: wide(path),
                width,
                height,
                frame_dur,
                current: Frame::black(4, 4),
                current_time: -1,
                loop_offset: 0,
                eos: false,
                scratch: Vec::new(),
            };
            me.read_next()?;
            Ok(me)
        }
    }

    fn read_next(&mut self) -> Result<bool> {
        unsafe {
            let mut flags = 0u32;
            let mut ts = 0i64;
            let mut sample: Option<IMFSample> = None;
            self.reader.ReadSample(
                FIRST_VIDEO,
                0,
                None,
                Some(&mut flags),
                Some(&mut ts),
                Some(&mut sample),
            )?;
            if flags & ENDOFSTREAM != 0 {
                self.eos = true;
                return Ok(false);
            }
            if flags & (INVALID_MEDIA_TYPE | CURRENT_MEDIA_TYPE_CHANGED) != 0 {
                return Ok(true);
            }
            if let Some(sample) = sample {
                let buf = sample.ConvertToContiguousBuffer()?;
                let mut p: *mut u8 = std::ptr::null_mut();
                let mut len = 0u32;
                buf.Lock(&mut p, None, Some(&mut len))?;
                self.scratch = slice::from_raw_parts(p, len as usize).to_vec();
                buf.Unlock()?;
                self.decode_rgb(&buf)?;
                self.current_time = ts;
            }
            Ok(true)
        }
    }

    fn decode_rgb(&mut self, buf: &IMFMediaBuffer) -> Result<()> {
        let (w, h) = (self.width as usize, self.height as usize);
        let mut rows: Vec<&[u8]> = Vec::with_capacity(h);
        let mut stride = w as i32 * 4;
        let mut bottom_up = false;
        let mut src: Vec<u8> = self.scratch.clone();

        // Le plus fiable : la vraie ligne de départ + le pas, via IMF2DBuffer.
        if let Ok(b2) = buf.cast::<IMF2DBuffer>() {
            let mut p: *mut u8 = std::ptr::null_mut();
            let mut pitch = 0i32;
            if unsafe { b2.Lock2D(&mut p, &mut pitch) }.is_ok() {
                if !p.is_null() {
                    src = unsafe { slice::from_raw_parts(p, (w * h * 4).max(1)) }.to_vec();
                }
                unsafe {
                    let _ = b2.Unlock2D();
                }
                if pitch < 0 {
                    bottom_up = true;
                    stride = -pitch;
                } else if pitch > 0 {
                    stride = pitch;
                }
            }
        }

        let row_len = w * 4;
        for j in 0..h {
            let logical = if bottom_up { h - 1 - j } else { j };
            let start = (logical as i32 * stride) as usize;
            let end = start + row_len;
            if end <= src.len() {
                rows.push(&src[start..end]);
            } else {
                rows.push(&src[src.len().saturating_sub(row_len)..]);
            }
        }

        let mut rgb = vec![0u8; w * h * 3];
        for (j, row) in rows.iter().enumerate() {
            let dst = &mut rgb[j * w * 3..(j + 1) * w * 3];
            for i in 0..w {
                let s = i * 4;
                let d = i * 3;
                // format RGB32 = B,G,R,X
                dst[d] = row[s + 2];
                dst[d + 1] = row[s + 1];
                dst[d + 2] = row[s];
            }
        }
        self.current = Frame {
            w: self.width,
            h: self.height,
            rgb,
        };
        Ok(())
    }

    pub fn current_ref(&self) -> &Frame {
        &self.current
    }

    /// Image à afficher à l'instant `t` (100 ns), avec bouclage automatique.
    pub fn frame_at(&mut self, t: i64) -> Result<&Frame> {
        let mut guard = 0;
        loop {
            guard += 1;
            if guard > 60 {
                break;
            }
            let local = t - self.loop_offset;
            if self.current_time < 0 {
                if !self.read_next()? {
                    break;
                }
                continue;
            }
            if self.current_time + self.frame_dur <= local {
                if !self.read_next()? {
                    // fin du clip : on reboucle et on décale la ligne de temps
                    let clip = (self.current_time + self.frame_dur).max(self.frame_dur);
                    self.rewind()?;
                    self.loop_offset += clip;
                }
            } else {
                break;
            }
        }
        Ok(&self.current)
    }

    fn rewind(&mut self) -> Result<()> {
        unsafe {
            let reader = open_video_reader(&self.path)?;
            let out = MFCreateMediaType()?;
            out.SetGUID(&MF_MT_MAJOR_TYPE, &MFMediaType_Video)?;
            out.SetGUID(&MF_MT_SUBTYPE, &MFVideoFormat_RGB32)?;
            out.SetUINT32(&MF_MT_INTERLACE_MODE, 2)?;
            set_pair(&out, &MF_MT_FRAME_SIZE, self.width, self.height)?;
            set_pair(&out, &MF_MT_PIXEL_ASPECT_RATIO, 1, 1)?;
            reader.SetCurrentMediaType(FIRST_VIDEO, None, &out)?;
            self.reader = reader;
            self.eos = false;
            self.current_time = -1;
            self.read_next()?;
        }
        Ok(())
    }
}

/// Ouvre un lecteur vidéo avec le traitement vidéo avancé (conversion RVB + redimensionnement).
fn open_video_reader(url: &HSTRING) -> Result<IMFSourceReader> {
    unsafe {
        let mut attrs: Option<IMFAttributes> = None;
        MFCreateAttributes(&mut attrs, 1)?;
        let attrs = attrs.unwrap();
        attrs.SetUINT32(&MF_SOURCE_READER_ENABLE_ADVANCED_VIDEO_PROCESSING, 1)?;
        let reader = MFCreateSourceReaderFromURL(url, &attrs)?;
        reader.SetStreamSelection(ALL_STREAMS, false)?;
        if reader.SetStreamSelection(FIRST_VIDEO, true).is_err() {
            bail!("Ce fichier ne contient aucune piste vidéo.");
        }
        Ok(reader)
    }
}
