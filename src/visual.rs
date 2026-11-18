//! Chargement des visuels (image fixe, GIF/APNG/WebP animé, clip vidéo) et
//! composition à la taille de sortie (remplir / contenir / fond flou) + conversion NV12.

use std::io::Cursor;
use std::path::{Path, PathBuf};
use std::sync::Arc;

use anyhow::{bail, Context, Result};
use image::AnimationDecoder;

pub const VIDEO_EXTS: &[&str] = &["mp4", "m4v", "mov", "webm", "mkv", "avi", "wmv", "mpg", "mpeg"];
pub const AUDIO_EXTS: &[&str] = &[
    "mp3", "m4a", "aac", "wav", "flac", "wma", "ogg", "opus", "aiff", "aif", "amr", "m4b",
];

const MAX_ANIM_BYTES: usize = 700 * 1024 * 1024;

pub fn ext_lower(path: &Path) -> String {
    path.extension()
        .map(|e| e.to_string_lossy().to_lowercase())
        .unwrap_or_default()
}

pub fn is_video_path(path: &Path) -> bool {
    VIDEO_EXTS.contains(&ext_lower(path).as_str())
}

pub fn is_audio_path(path: &Path) -> bool {
    AUDIO_EXTS.contains(&ext_lower(path).as_str())
}

#[derive(Clone)]
pub struct Frame {
    pub w: u32,
    pub h: u32,
    /// RGB 8 bits, ligne du haut en premier.
    pub rgb: Vec<u8>,
}

impl Frame {
    pub fn black(w: u32, h: u32) -> Self {
        Self {
            w,
            h,
            rgb: vec![0; (w as usize * h as usize * 3).max(3)],
        }
    }

    fn from_rgba(img: &image::RgbaImage) -> Self {
        let (w, h) = img.dimensions();
        let mut rgb = vec![0u8; w as usize * h as usize * 3];
        for (px, dst) in img.pixels().zip(rgb.chunks_exact_mut(3)) {
            let a = px[3] as u32;
            dst[0] = (px[0] as u32 * a / 255) as u8;
            dst[1] = (px[1] as u32 * a / 255) as u8;
            dst[2] = (px[2] as u32 * a / 255) as u8;
        }
        Self { w, h, rgb }
    }

    fn from_rgb(img: &image::RgbImage) -> Self {
        let (w, h) = img.dimensions();
        Self {
            w,
            h,
            rgb: img.as_raw().clone(),
        }
    }

    /// Réduit l'image pour l'aperçu (max `max_px` sur le plus grand côté).
    pub fn thumbnail(&self, max_px: u32) -> Self {
        let (w, h) = (self.w, self.h);
        if w.max(h) <= max_px {
            return self.clone();
        }
        let scale = max_px as f32 / w.max(h) as f32;
        let tw = ((w as f32 * scale).round() as u32).max(1);
        let th = ((h as f32 * scale).round() as u32).max(1);
        let src = image::RgbImage::from_raw(w, h, self.rgb.clone()).expect("frame rgb");
        let out = image::imageops::resize(&src, tw, th, image::imageops::FilterType::Triangle);
        Self {
            w: tw,
            h: th,
            rgb: out.into_raw(),
        }
    }
}

pub struct Anim {
    pub frames: Vec<Frame>,
    /// Durée d'affichage de chaque image, en ms.
    pub delays: Vec<u32>,
    pub total_ms: u64,
}

pub enum Source {
    Still(Arc<Frame>),
    Anim(Arc<Anim>),
    Video(PathBuf),
}

impl Clone for Source {
    fn clone(&self) -> Self {
        match self {
            Source::Still(f) => Source::Still(Arc::clone(f)),
            Source::Anim(a) => Source::Anim(Arc::clone(a)),
            Source::Video(p) => Source::Video(p.clone()),
        }
    }
}

pub struct Loaded {
    pub source: Source,
    pub preview: Frame,
    pub label: String,
}

fn anim_from_frames(frames: Vec<image::Frame>, kind: &str) -> Result<Loaded> {
    let (w, h) = (frames[0].buffer().width(), frames[0].buffer().height());
    let bytes = frames.len() * (w as usize * h as usize * 3);
    if bytes > MAX_ANIM_BYTES {
        bail!(
            "Animation trop lourde en mémoire ({} images de {}×{}). Essaie une image fixe.",
            frames.len(),
            w,
            h
        );
    }
    let mut out = Vec::with_capacity(frames.len());
    let mut delays = Vec::with_capacity(frames.len());
    let mut total = 0u64;
    for f in frames {
        let (numer, denom) = f.delay().numer_denom_ms();
        let mut ms = if denom == 0 {
            100
        } else {
            (numer as u64 + denom as u64 - 1) / denom as u64
        };
        ms = ms.clamp(20, 10_000);
        delays.push(ms as u32);
        total += ms;
        out.push(Frame::from_rgba(f.buffer()));
    }
    let preview = out[0].thumbnail(600);
    let label = format!(
        "{} · {}×{} · {} images · {:.1} s",
        kind,
        w,
        h,
        out.len(),
        total as f64 / 1000.0
    );
    Ok(Loaded {
        source: Source::Anim(Arc::new(Anim {
            frames: out,
            delays,
            total_ms: total,
        })),
        preview,
        label,
    })
}

fn still(frame: Frame, kind: &str) -> Loaded {
    let label = format!("{} · {}×{}", kind, frame.w, frame.h);
    Loaded {
        preview: frame.thumbnail(600),
        label,
        source: Source::Still(Arc::new(frame)),
    }
}

/// Construit un visuel fixe à partir d'une image RGBA brute (presse-papiers).
pub fn loaded_from_rgba(rgba: &image::RgbaImage, label: &str) -> Loaded {
    let frame = Frame::from_rgba(rgba);
    let mut loaded = still(frame, label);
    loaded.label = format!("{} · {}×{}", label, loaded.preview.w, loaded.preview.h);
    loaded
}

/// Reconnaît les conteneurs vidéo les plus courants d'après leur signature.
pub fn sniff_video(bytes: &[u8]) -> Option<&'static str> {
    if bytes.len() > 12 && &bytes[4..8] == b"ftyp" {
        return Some("mp4");
    }
    if bytes.starts_with(&[0x1A, 0x45, 0xDF, 0xA3]) {
        return Some("webm");
    }
    if bytes.starts_with(b"RIFF") && bytes.len() > 12 && &bytes[8..12] == b"AVI " {
        return Some("avi");
    }
    None
}

pub fn load_path(path: &Path) -> Result<Loaded> {
    if is_video_path(path) {
        let mut vs = crate::mf::VideoSource::open(path)?;
        let preview = vs.frame_at(0)?.thumbnail(600);
        let label = format!(
            "Vidéo · {}×{} · {}",
            vs.width,
            vs.height,
            ext_lower(path).to_uppercase()
        );
        return Ok(Loaded {
            source: Source::Video(path.to_path_buf()),
            preview,
            label,
        });
    }
    let bytes = std::fs::read(path).with_context(|| format!("Lecture impossible : {}", path.display()))?;
    load_bytes(&bytes, &ext_lower(path))
}

pub fn load_bytes(bytes: &[u8], ext: &str) -> Result<Loaded> {
    let format = image::guess_format(bytes).ok();
    if let Some(fmt) = format {
        match fmt {
            image::ImageFormat::Gif => {
                let dec = image::codecs::gif::GifDecoder::new(Cursor::new(bytes))?;
                let frames = dec.into_frames().collect_frames()?;
                if frames.is_empty() {
                    bail!("GIF vide");
                }
                return anim_from_frames(frames, "GIF");
            }
            image::ImageFormat::Png => {
                let dec = image::codecs::png::PngDecoder::new(Cursor::new(bytes))?;
                if dec.is_apng().unwrap_or(false) {
                    let frames = dec.apng()?.into_frames().collect_frames()?;
                    if !frames.is_empty() {
                        return anim_from_frames(frames, "APNG");
                    }
                }
                let img = image::load_from_memory_with_format(bytes, fmt)?;
                return Ok(match img {
                    image::DynamicImage::ImageRgba8(rgba) => {
                        let f = Frame::from_rgba(&rgba);
                        still(f, "PNG")
                    }
                    other => {
                        let f = Frame::from_rgb(&other.to_rgb8());
                        still(f, "PNG")
                    }
                });
            }
            image::ImageFormat::WebP => {
                let dec = image::codecs::webp::WebPDecoder::new(Cursor::new(bytes))?;
                if dec.has_animation() {
                    let frames = dec.into_frames().collect_frames()?;
                    if !frames.is_empty() {
                        return anim_from_frames(frames, "WebP animé");
                    }
                }
                let img = image::load_from_memory_with_format(bytes, fmt)?;
                let f = Frame::from_rgb(&img.to_rgb8());
                return Ok(still(f, "WebP"));
            }
            _ => {
                let img = image::load_from_memory_with_format(bytes, fmt)?;
                let kind = match fmt {
                    image::ImageFormat::Jpeg => "JPEG",
                    image::ImageFormat::Bmp => "BMP",
                    image::ImageFormat::Tiff => "TIFF",
                    _ => "Image",
                };
                let f = match img {
                    image::DynamicImage::ImageRgba8(rgba) => Frame::from_rgba(&rgba),
                    other => Frame::from_rgb(&other.to_rgb8()),
                };
                return Ok(still(f, kind));
            }
        }
    }
    let _ = ext;
    bail!("Format d'image non reconnu (JPG, PNG, GIF, WebP, BMP, TIFF acceptés).")
}

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Fit {
    Fill,
    Contain,
    Blur,
}

impl Fit {
    pub fn label(self) -> &'static str {
        match self {
            Fit::Fill => "Remplir",
            Fit::Contain => "Contenir",
            Fit::Blur => "Fond flou",
        }
    }
    pub fn hint(self) -> &'static str {
        match self {
            Fit::Fill => "L'image remplit le cadre, les bords sont rognés",
            Fit::Contain => "L'image entière, avec des bandes noires",
            Fit::Blur => "L'image entière sur un fond flou",
        }
    }
}

fn cover_rect(sw: u32, sh: u32, tw: u32, th: u32) -> (u32, u32, u32, u32) {
    let target = tw as f64 / th as f64;
    let src = sw as f64 / sh as f64;
    if src > target {
        let w = (sh as f64 * target).round().max(1.0) as u32;
        ((sw - w) / 2, 0, w.min(sw), sh)
    } else {
        let h = (sw as f64 / target).round().max(1.0) as u32;
        (0, (sh - h) / 2, sw, h.min(sh))
    }
}

fn fit_size(sw: u32, sh: u32, tw: u32, th: u32) -> (u32, u32) {
    let scale = (tw as f64 / sw as f64).min(th as f64 / sh as f64);
    (
        ((sw as f64 * scale).round() as u32).clamp(1, tw),
        ((sh as f64 * scale).round() as u32).clamp(1, th),
    )
}

fn resize_to(src: &Frame, rect: (u32, u32, u32, u32), out_w: u32, out_h: u32) -> Vec<u8> {
    let (x, y, w, h) = rect;
    let img = image::RgbImage::from_raw(src.w, src.h, src.rgb.clone()).expect("frame");
    let sub = image::imageops::crop_imm(&img, x, y, w, h);
    let resized = image::imageops::resize(
        &sub.to_image(),
        out_w.max(1),
        out_h.max(1),
        image::imageops::FilterType::Triangle,
    );
    resized.into_raw()
}

/// Flou rectangulaire séparable, 2 passes : assez doux, très rapide.
fn blur_rgb(buf: &mut [u8], w: usize, h: usize, radius: usize) {
    if radius == 0 || w < 2 || h < 2 {
        return;
    }
    let r = radius.min(w / 2).min(h / 2).max(1);
    let mut tmp = vec![0u8; buf.len()];
    // horizontal
    for y in 0..h {
        for x in 0..w {
            let mut acc = [0u32; 3];
            let mut n = 0u32;
            let x0 = x.saturating_sub(r);
            let x1 = (x + r).min(w - 1);
            for xx in x0..=x1 {
                let o = (y * w + xx) * 3;
                acc[0] += buf[o] as u32;
                acc[1] += buf[o + 1] as u32;
                acc[2] += buf[o + 2] as u32;
                n += 1;
            }
            let o = (y * w + x) * 3;
            tmp[o] = (acc[0] / n) as u8;
            tmp[o + 1] = (acc[1] / n) as u8;
            tmp[o + 2] = (acc[2] / n) as u8;
        }
    }
    // vertical
    for y in 0..h {
        let y0 = y.saturating_sub(r);
        let y1 = (y + r).min(h - 1);
        for x in 0..w {
            let mut acc = [0u32; 3];
            let mut n = 0u32;
            for yy in y0..=y1 {
                let o = (yy * w + x) * 3;
                acc[0] += tmp[o] as u32;
                acc[1] += tmp[o + 1] as u32;
                acc[2] += tmp[o + 2] as u32;
                n += 1;
            }
            let o = (y * w + x) * 3;
            buf[o] = (acc[0] / n) as u8;
            buf[o + 1] = (acc[1] / n) as u8;
            buf[o + 2] = (acc[2] / n) as u8;
        }
    }
}

/// RGB -> NV12 (BT.709, plage 16-235), écrit directement dans `out`.
pub fn rgb_to_nv12(rgb: &[u8], w: usize, h: usize, out: &mut Vec<u8>) {
    let y_size = w * h;
    let w2 = w / 2;
    let c_size = w2 * (h / 2) * 2;
    out.clear();
    out.resize(y_size + c_size, 0);
    let (y_plane, c_plane) = out.split_at_mut(y_size);

    for j in 0..h {
        let row = &rgb[j * w * 3..(j + 1) * w * 3];
        let yrow = &mut y_plane[j * w..(j + 1) * w];
        for i in 0..w {
            let o = i * 3;
            let r = row[o] as i32;
            let g = row[o + 1] as i32;
            let b = row[o + 2] as i32;
            yrow[i] = (16 + ((11966 * r + 40256 * g + 4063 * b) >> 16)).clamp(16, 235) as u8;
        }
    }

    for jb in 0..h / 2 {
        let row0 = &rgb[(2 * jb) * w * 3..(2 * jb + 1) * w * 3];
        let row1 = &rgb[(2 * jb + 1) * w * 3..(2 * jb + 2) * w * 3];
        let crow = &mut c_plane[jb * w2 * 2..(jb + 1) * w2 * 2];
        for ib in 0..w2 {
            let a = ib * 6;
            let b_ = a + 3;
            let r = (row0[a] as i32 + row0[b_] as i32 + row1[a] as i32 + row1[b_] as i32 + 2) >> 2;
            let g =
                (row0[a + 1] as i32 + row0[b_ + 1] as i32 + row1[a + 1] as i32 + row1[b_ + 1] as i32 + 2)
                    >> 2;
            let b =
                (row0[a + 2] as i32 + row0[b_ + 2] as i32 + row1[a + 2] as i32 + row1[b_ + 2] as i32 + 2)
                    >> 2;
            let u = 128 + ((-6596 * r - 22188 * g + 28785 * b) >> 16);
            let v = 128 + ((28785 * r - 24159 * g - 4626 * b) >> 16);
            crow[ib * 2] = u.clamp(16, 240) as u8;
            crow[ib * 2 + 1] = v.clamp(16, 240) as u8;
        }
    }
}

pub struct Composer {
    pub tw: u32,
    pub th: u32,
    fit: Fit,
    background: Vec<u8>,
    canvas: Vec<u8>,
    nv12: Vec<u8>,
    last_key: u64,
}

impl Composer {
    /// `reference` sert à fabriquer le fond flou (une seule fois, pour toute la vidéo).
    pub fn new(tw: u32, th: u32, fit: Fit, reference: &Frame) -> Self {
        let tw = tw - tw % 2;
        let th = th - th % 2;
        let mut background = vec![0u8; tw as usize * th as usize * 3];
        if fit == Fit::Blur {
            background = resize_to(
                reference,
                cover_rect(reference.w, reference.h, tw, th),
                tw,
                th,
            );
            let radius = (tw.min(th) as usize / 24).max(4);
            blur_rgb(&mut background, tw as usize, th as usize, radius);
            // léger assombrissement pour que l'image se détache
            for px in background.chunks_exact_mut(3) {
                px[0] = (px[0] as u32 * 62 / 100) as u8;
                px[1] = (px[1] as u32 * 62 / 100) as u8;
                px[2] = (px[2] as u32 * 62 / 100) as u8;
            }
        }
        Self {
            tw,
            th,
            fit,
            background,
            canvas: vec![0u8; tw as usize * th as usize * 3],
            nv12: Vec::new(),
            last_key: u64::MAX,
        }
    }

    /// Comme [`Self::render`], mais ne recompose pas si `key` n'a pas changé
    /// (une image fixe ou une image de GIF affichée plusieurs fois).
    pub fn render_cached(&mut self, src: &Frame, key: u64) -> &[u8] {
        let reuse = key != u64::MAX && key == self.last_key && !self.nv12.is_empty();
        if !reuse {
            self.render(src);
            self.last_key = key;
        }
        &self.nv12
    }

    /// Compose l'image source à la taille cible et renvoie le plan NV12 prêt à encoder.
    pub fn render(&mut self, src: &Frame) -> &[u8] {
        match self.fit {
            Fit::Fill => {
                let out = resize_to(src, cover_rect(src.w, src.h, self.tw, self.th), self.tw, self.th);
                rgb_to_nv12(&out, self.tw as usize, self.th as usize, &mut self.nv12);
            }
            _ => {
                self.canvas.copy_from_slice(&self.background);
                let (fw, fh) = fit_size(src.w, src.h, self.tw, self.th);
                let scaled = resize_to(src, (0, 0, src.w, src.h), fw, fh);
                let x0 = (self.tw - fw) / 2;
                let y0 = (self.th - fh) / 2;
                for row in 0..fh {
                    let dst = ((y0 + row) as usize * self.tw as usize + x0 as usize) * 3;
                    let src_row = row as usize * fw as usize * 3;
                    self.canvas[dst..dst + fw as usize * 3]
                        .copy_from_slice(&scaled[src_row..src_row + fw as usize * 3]);
                }
                rgb_to_nv12(
                    &self.canvas,
                    self.tw as usize,
                    self.th as usize,
                    &mut self.nv12,
                );
            }
        }
        &self.nv12
    }
}
