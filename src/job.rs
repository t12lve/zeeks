//! Tâche d'encodage : déroule l'audio, compose chaque image et écrit le MP4.

use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::sync::{Arc, Mutex};

use anyhow::{bail, Result};

use crate::mf::{self, TICKS, AUDIO_RATE};
use crate::visual::{Anim, Composer, Fit, Frame, Source};

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Quality {
    Light,
    Standard,
    High,
}

impl Quality {
    pub fn label(self) -> &'static str {
        match self {
            Quality::Light => "Léger",
            Quality::Standard => "Standard",
            Quality::High => "Haute",
        }
    }
    fn factor(self) -> f64 {
        match self {
            Quality::Light => 0.5,
            Quality::Standard => 1.0,
            Quality::High => 2.0,
        }
    }
}

pub struct Spec {
    pub audio: PathBuf,
    pub visual: Source,
    pub out: PathBuf,
    pub width: u32,
    pub height: u32,
    pub fps: u32,
    pub quality: Quality,
    pub fit: Fit,
}

impl Spec {
    fn bitrate(&self) -> u32 {
        let base = 8_000_000.0 * (self.width as f64 * self.height as f64) / (1920.0 * 1080.0);
        ((base * self.quality.factor()) as u32).clamp(500_000, 40_000_000)
    }
}

#[derive(Clone)]
pub struct Stats {
    pub seconds: f64,
    pub bytes: u64,
    pub elapsed: f64,
    pub output: PathBuf,
    pub t_decode: f64,
    pub t_compose: f64,
    pub t_write: f64,
}

pub struct Progress {
    pub percent: AtomicU32,
    pub cancel: AtomicBool,
    pub done: Mutex<Option<Result<Stats, String>>>,
}

impl Progress {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            percent: AtomicU32::new(0),
            cancel: AtomicBool::new(false),
            done: Mutex::new(None),
        })
    }
    pub fn is_done(&self) -> bool {
        self.done.lock().unwrap().is_some()
    }
}

enum Runner {
    Still(Arc<Frame>),
    Anim {
        anim: Arc<Anim>,
        cumulative: Vec<u64>,
    },
    Video(mf::VideoSource),
}

impl Runner {
    /// Renvoie (image à l'instant t, clé de cache pour la composition).
    fn frame_at(&mut self, t: i64) -> Result<(&Frame, u64)> {
        match self {
            Runner::Still(f) => Ok((f, 0)),
            Runner::Anim { anim, cumulative } => {
                let t_ms = (t / 10_000) as u64;
                let pos = if anim.total_ms == 0 {
                    0
                } else {
                    t_ms % anim.total_ms
                };
                let mut idx = cumulative.len().saturating_sub(1);
                for (i, end) in cumulative.iter().enumerate() {
                    if pos < *end {
                        idx = i;
                        break;
                    }
                }
                Ok((&anim.frames[idx], idx as u64 + 1))
            }
            Runner::Video(v) => {
                v.frame_at(t)?;
                Ok((v.current_ref(), u64::MAX))
            }
        }
    }
}

fn run(spec: &Spec, progress: &Progress) -> Result<Stats> {
    let started = std::time::Instant::now();
    let audio = mf::decode_audio(&spec.audio)?;
    let duration = audio.duration();
    if duration <= 0.05 {
        bail!("L'audio est trop court.");
    }

    let (width, height, fps) = (spec.width, spec.height, spec.fps.max(1));
    let total_frames = (duration * fps as f64).ceil() as u64;

    let mut runner = match &spec.visual {
        Source::Still(f) => Runner::Still(Arc::clone(f)),
        Source::Anim(a) => {
            let mut cumulative = Vec::with_capacity(a.frames.len());
            let mut acc = 0u64;
            for d in &a.delays {
                acc += *d as u64;
                cumulative.push(acc.max(1));
            }
            Runner::Anim {
                anim: Arc::clone(a),
                cumulative,
            }
        }
        Source::Video(p) => Runner::Video(mf::VideoSource::open(p)?),
    };

    let reference = match runner.frame_at(0) {
        Ok((f, _)) => f.clone(),
        Err(e) => return Err(e),
    };
    let mut composer = Composer::new(width, height, spec.fit, &reference);
    let (cw, ch) = (composer.tw, composer.th);

    let writer = mf::Mp4Writer::new(&spec.out, cw, ch, fps, spec.bitrate())?;
    let frame_dur = TICKS / fps as i64;
    let audio_per_frame = AUDIO_RATE / fps;
    let total_audio = audio.frames() as u64;
    let mut t_decode = 0.0f64;
    let mut t_compose = 0.0f64;
    let mut t_write = 0.0f64;

    for i in 0..total_frames {
        if progress.cancel.load(Ordering::Relaxed) {
            bail!("Annulé");
        }
        let t = i as i64 * TICKS / fps as i64;

        let t0 = std::time::Instant::now();
        let (frame, key) = runner.frame_at(t)?;
        t_decode += t0.elapsed().as_secs_f64();

        let t1 = std::time::Instant::now();
        let nv12 = composer.render_cached(frame, key);
        t_compose += t1.elapsed().as_secs_f64();

        let t2 = std::time::Instant::now();
        writer.write_video(nv12, t, frame_dur)?;
        t_write += t2.elapsed().as_secs_f64();

        let a0 = i * audio_per_frame as u64;
        let a1 = ((i + 1) * audio_per_frame as u64).min(total_audio);
        if a0 < a1 {
            let slice = &audio.samples[(a0 as usize) * 2..(a1 as usize) * 2];
            let t_audio = a0 as i64 * TICKS / AUDIO_RATE as i64;
            writer.write_audio(slice, t_audio, (a1 - a0) as u32)?;
        }

        let pct = ((i + 1) * 100 / total_frames.max(1)) as u32;
        progress.percent.store(pct, Ordering::Relaxed);
    }

    writer.finish()?;
    let bytes = std::fs::metadata(&spec.out).map(|m| m.len()).unwrap_or(0);
    Ok(Stats {
        seconds: duration,
        bytes,
        elapsed: started.elapsed().as_secs_f64(),
        output: spec.out.clone(),
        t_decode,
        t_compose,
        t_write,
    })
}

/// Lance l'encodage dans un thread et renvoie son état partagé.
pub fn spawn(spec: Spec) -> Arc<Progress> {
    let progress = Progress::new();
    let shared = Arc::clone(&progress);
    let out = spec.out.clone();
    std::thread::spawn(move || {
        let result = run(&spec, &shared);
        let result = match result {
            Ok(stats) => Ok(stats),
            Err(e) => {
                if out.exists() {
                    let _ = std::fs::remove_file(&out);
                }
                Err(format!("{e:#}"))
            }
        };
        *shared.done.lock().unwrap() = Some(result);
    });
    progress
}

/// Version bloquante (mode ligne de commande).
pub fn run_blocking(spec: &Spec) -> Result<Stats> {
    let progress = Progress::new();
    run(spec, &progress)
}

// Petit utilitaire de formatage partagé avec l'interface.
pub fn human_size(bytes: u64) -> String {
    let mb = bytes as f64 / (1024.0 * 1024.0);
    if mb >= 1.0 {
        format!("{mb:.1} Mo")
    } else {
        format!("{:.0} Ko", bytes as f64 / 1024.0)
    }
}

pub fn human_duration(secs: f64) -> String {
    let total = secs.round() as u64;
    let s = total % 60;
    let m = (total / 60) % 60;
    let h = total / 3600;
    if h > 0 {
        format!("{h} h {m:02} min {s:02} s")
    } else if m > 0 {
        format!("{m} min {s:02} s")
    } else {
        format!("{s} s")
    }
}

pub fn clock(secs: f64) -> String {
    let total = secs.max(0.0).round() as u64;
    format!("{:02}:{:02}", total / 60, total % 60)
}
