#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod job;
mod mf;
mod net;
mod player;
mod visual;

use std::path::{Path, PathBuf};
use std::sync::atomic::Ordering;
use std::sync::Arc;
use std::time::{Duration, Instant};

use eframe::egui::{
    self, Align, Color32, CornerRadius, FontFamily, FontId, Layout, Margin, RichText, Stroke, Vec2,
};
use job::{Progress, Quality, Spec, Stats};
use visual::{Fit, Loaded};

// Palette châssis studio sombre & ZEEKS (Bleu Roi #2563EB & Orange Ambré #EA580C)
const BG: Color32 = Color32::from_rgb(0x0B, 0x0F, 0x19); // #0B0F19 (Châssis sombre)
const CARD: Color32 = Color32::from_rgb(0x12, 0x16, 0x22); // #121622 (Cartes rack)
const CARD_SOFT: Color32 = Color32::from_rgb(0x16, 0x1D, 0x2B); // #161D2B (Composants rack encastrés)
const BORDER: Color32 = Color32::from_rgb(0x2A, 0x35, 0x48); // #2A3548 (Bordures métalliques console)
const TEXT: Color32 = Color32::from_rgb(240, 244, 250); // Texte clair haute lisibilité
const DIM: Color32 = Color32::from_rgb(148, 163, 184); // Gris acier
const FAINT: Color32 = Color32::from_rgb(94, 106, 126); // Gris atténué
const ACCENT_BLUE: Color32 = Color32::from_rgb(0x25, 0x63, 0xEB); // #2563EB (Bleu Roi ZEEKS)
const ACCENT_AMBER: Color32 = Color32::from_rgb(0xEA, 0x58, 0x0C); // #EA580C (Orange Ambré ZEEKS)
const ACCENT_BLUE_SOFT: Color32 = Color32::from_rgb(0x18, 0x27, 0x47);
const OK: Color32 = Color32::from_rgb(34, 197, 94); // #22C55E
const DANGER: Color32 = Color32::from_rgb(239, 68, 68); // #EF4444

#[derive(Clone, Copy, PartialEq, Eq)]
enum Format {
    Wide,
    Tall,
    Square,
}

impl Format {
    fn dims(self) -> (u32, u32) {
        match self {
            Format::Wide => (1920, 1080),
            Format::Tall => (1080, 1920),
            Format::Square => (1080, 1080),
        }
    }
    fn label(self) -> &'static str {
        match self {
            Format::Wide => "16:9",
            Format::Tall => "9:16",
            Format::Square => "1:1",
        }
    }
    fn hint(self) -> &'static str {
        match self {
            Format::Wide => "1920 × 1080 · YouTube, Web, Écran large",
            Format::Tall => "1080 × 1920 · TikTok, Reels, Shorts",
            Format::Square => "1080 × 1080 · Post, Carré, Flux",
        }
    }
}

struct AudioSlot {
    path: PathBuf,
    name: String,
    duration: f64,
    size: u64,
    player: Option<player::Player>,
    player_error: Option<String>,
}

struct VisualSlot {
    loaded: Loaded,
    texture: egui::TextureHandle,
}

#[derive(Default)]
struct VuState {
    l_rms: f32,
    r_rms: f32,
    l_peak: f32,
    r_peak: f32,
    l_db: f32,
    r_db: f32,
    l_peak_hold: f32,
    r_peak_hold: f32,
}

struct App {
    audio: Option<AudioSlot>,
    visual: Option<VisualSlot>,
    format: Format,
    fit: Fit,
    quality: Quality,
    url: String,
    show_url: bool,
    job: Option<Arc<Progress>>,
    started: Option<Instant>,
    result: Option<Stats>,
    error: Option<String>,
    drag_hover: bool,
    logo: egui::TextureHandle,
    vu: VuState,
}

impl App {
    fn new(cc: &eframe::CreationContext<'_>) -> Self {
        setup_style(&cc.egui_ctx);
        let logo_bytes = include_bytes!("../assets/logo/kit/zeeks_lockup_horizontal.png");
        let logo_img = image::load_from_memory(logo_bytes)
            .expect("Logo PNG ZEEKS valide")
            .to_rgba8();
        let (lw, lh) = logo_img.dimensions();
        let logo_color_img = egui::ColorImage::from_rgba_unmultiplied(
            [lw as usize, lh as usize],
            &logo_img.into_raw(),
        );
        let logo = cc.egui_ctx.load_texture(
            "zeeks_logo",
            logo_color_img,
            egui::TextureOptions::LINEAR,
        );

        Self {
            audio: None,
            visual: None,
            format: Format::Wide,
            fit: Fit::Fill,
            quality: Quality::Standard,
            url: String::new(),
            show_url: false,
            job: None,
            started: None,
            result: None,
            error: None,
            drag_hover: false,
            logo,
            vu: VuState::default(),
        }
    }

    // -- chargements ------------------------------------------------------

    fn set_audio(&mut self, path: PathBuf) {
        let size = std::fs::metadata(&path).map(|m| m.len()).unwrap_or(0);
        let name = path
            .file_name()
            .map(|s| s.to_string_lossy().to_string())
            .unwrap_or_default();
        match mf::decode_audio(&path) {
            Ok(pcm) => {
                if pcm.duration() < 0.05 {
                    self.error = Some("Ce fichier audio est vide ou trop court.".into());
                    return;
                }
                let duration = pcm.duration();
                let (player, player_error) = match player::Player::new(Arc::new(pcm)) {
                    Ok(p) => (Some(p), None),
                    Err(e) => (None, Some(format!("{e:#}"))),
                };
                self.audio = Some(AudioSlot {
                    path,
                    name,
                    duration,
                    size,
                    player,
                    player_error,
                });
                self.error = None;
                self.result = None;
            }
            Err(e) => self.error = Some(format!("{e:#}")),
        }
    }

    fn set_visual(&mut self, ctx: &egui::Context, loaded: Loaded) {
        let p = &loaded.preview;
        let img = egui::ColorImage::from_rgb([p.w as usize, p.h as usize], &p.rgb);
        let texture = ctx.load_texture("apercu", img, egui::TextureOptions::LINEAR);
        self.visual = Some(VisualSlot { loaded, texture });
        self.error = None;
        self.result = None;
    }

    fn load_visual_path(&mut self, ctx: &egui::Context, path: PathBuf) {
        match visual::load_path(&path) {
            Ok(loaded) => self.set_visual(ctx, loaded),
            Err(e) => self.error = Some(format!("{e:#}")),
        }
    }

    fn load_visual_bytes(&mut self, ctx: &egui::Context, bytes: &[u8], ext: &str) {
        match visual::load_bytes(bytes, ext) {
            Ok(loaded) => self.set_visual(ctx, loaded),
            Err(e) => self.error = Some(format!("{e:#}")),
        }
    }

    fn load_url(&mut self, ctx: &egui::Context) {
        let url = self.url.trim().to_string();
        if url.is_empty() {
            self.error = Some("Colle une URL puis clique sur Charger.".into());
            return;
        }
        match net::fetch(&url) {
            Ok(bytes) => {
                let ext = url
                    .split(['?', '#'])
                    .next()
                    .and_then(|u| u.rsplit('.').next())
                    .unwrap_or("")
                    .to_lowercase();
                let is_video = visual::VIDEO_EXTS.contains(&ext.as_str())
                    || (image::guess_format(&bytes).is_err()
                        && visual::sniff_video(&bytes).is_some());
                if is_video {
                    let ext = if ext.is_empty() { "mp4".to_string() } else { ext };
                    let path = std::env::temp_dir().join(format!(
                        "zeeks_{}.{}",
                        std::process::id(),
                        ext
                    ));
                    if let Err(e) = std::fs::write(&path, &bytes) {
                        self.error = Some(format!("Écriture temporaire impossible : {e}"));
                        return;
                    }
                    self.load_visual_path(ctx, path);
                } else {
                    self.load_visual_bytes(ctx, &bytes, &ext);
                }
            }
            Err(e) => self.error = Some(format!("{e:#}")),
        }
    }

    fn paste(&mut self, ctx: &egui::Context) {
        match arboard::Clipboard::new() {
            Ok(mut cb) => {
                if let Ok(img) = cb.get_image() {
                    let rgba = image::RgbaImage::from_raw(
                        img.width as u32,
                        img.height as u32,
                        img.bytes.to_vec(),
                    );
                    match rgba {
                        Some(rgba) => {
                            let loaded = visual::loaded_from_rgba(&rgba, "Presse-papiers");
                            self.set_visual(ctx, loaded);
                        }
                        None => self.error = Some("Image du presse-papiers illisible.".into()),
                    }
                    return;
                }
                if let Ok(text) = cb.get_text() {
                    let t = text.trim().to_string();
                    if t.starts_with("http://") || t.starts_with("https://") {
                        self.url = t;
                        self.show_url = true;
                        self.load_url(ctx);
                        return;
                    }
                }
                self.error =
                    Some("Le presse-papiers ne contient ni image ni URL (essaie Ctrl+V).".into());
            }
            Err(e) => self.error = Some(format!("Presse-papiers inaccessible : {e}")),
        }
    }

    fn accept_path(&mut self, ctx: &egui::Context, path: PathBuf) {
        if visual::is_audio_path(&path) {
            self.set_audio(path);
        } else {
            self.load_visual_path(ctx, path);
        }
    }

    fn start_job(&mut self) {
        let (Some(audio_path), Some(vis)) = (
            self.audio.as_ref().map(|a| a.path.clone()),
            self.visual.as_ref(),
        ) else {
            self.error = Some("Ajoute un fichier audio et une image pour continuer.".into());
            return;
        };
        let default_name = format!(
            "{}.mp4",
            audio_path
                .file_stem()
                .map(|s| s.to_string_lossy().to_string())
                .unwrap_or_else(|| "video".into())
        );
        let chosen = rfd::FileDialog::new()
            .add_filter("Vidéo MP4", &["mp4"])
            .set_file_name(&default_name)
            .set_directory(
                audio_path
                    .parent()
                    .map(|p| p.to_path_buf())
                    .unwrap_or_else(|| PathBuf::from(".")),
            )
            .save_file();
        let Some(mut out) = chosen else { return };
        if out.extension().is_none() {
            out.set_extension("mp4");
        }
        let (width, height) = self.format.dims();
        let spec = Spec {
            audio: audio_path,
            visual: vis.loaded.source.clone(),
            out,
            width,
            height,
            fps: 30,
            quality: self.quality,
            fit: self.fit,
        };
        // on coupe l'aperçu sonore pendant l'encodage
        if let Some(audio) = self.audio.as_mut() {
            if let Some(player) = audio.player.as_mut() {
                player.stop();
            }
        }
        self.error = None;
        self.result = None;
        self.started = Some(Instant::now());
        self.job = Some(job::spawn(spec));
    }

    fn poll_job(&mut self, ctx: &egui::Context) {
        let Some(progress) = self.job.clone() else { return };
        if progress.is_done() {
            let res = progress.done.lock().unwrap().take();
            self.job = None;
            self.started = None;
            match res {
                Some(Ok(stats)) => self.result = Some(stats),
                Some(Err(e)) => {
                    if e != "Annulé" {
                        self.error = Some(e)
                    }
                }
                None => {}
            }
            ctx.request_repaint();
        } else {
            ctx.request_repaint_after(Duration::from_millis(30));
        }
    }
}

// ---------------------------------------------------------------------------
// Style
// ---------------------------------------------------------------------------

fn setup_style(ctx: &egui::Context) {
    let mut visuals = egui::Visuals::dark();
    visuals.panel_fill = BG;
    visuals.window_fill = CARD;
    visuals.extreme_bg_color = CARD_SOFT;
    visuals.faint_bg_color = CARD_SOFT;
    visuals.override_text_color = Some(TEXT);
    visuals.widgets.noninteractive.bg_stroke = Stroke::new(1.0, BORDER);
    visuals.widgets.inactive.bg_fill = CARD_SOFT;
    visuals.widgets.inactive.bg_stroke = Stroke::new(1.0, BORDER);
    visuals.widgets.hovered.bg_fill = Color32::from_rgb(0x1B, 0x24, 0x36);
    visuals.widgets.hovered.bg_stroke = Stroke::new(1.0, Color32::from_rgb(0x3B, 0x82, 0xF6));
    visuals.widgets.active.bg_fill = ACCENT_BLUE_SOFT;
    visuals.selection.bg_fill = ACCENT_BLUE_SOFT;
    visuals.selection.stroke = Stroke::new(1.0, ACCENT_BLUE);
    visuals.window_corner_radius = CornerRadius::same(12);

    ctx.all_styles_mut(|style| {
        style.visuals = visuals.clone();
        style.spacing.item_spacing = Vec2::new(10.0, 10.0);
        style.spacing.button_padding = Vec2::new(14.0, 9.0);
        style.text_styles.insert(
            egui::TextStyle::Body,
            FontId::new(14.0, FontFamily::Proportional),
        );
        style.text_styles.insert(
            egui::TextStyle::Button,
            FontId::new(14.0, FontFamily::Proportional),
        );
        style.text_styles.insert(
            egui::TextStyle::Small,
            FontId::new(11.5, FontFamily::Proportional),
        );
        style.text_styles.insert(
            egui::TextStyle::Heading,
            FontId::new(24.0, FontFamily::Proportional),
        );
    });
}

fn card<R>(ui: &mut egui::Ui, add: impl FnOnce(&mut egui::Ui) -> R) -> R {
    let outer = ui.available_width();
    let frame_response = egui::Frame::default()
        .fill(CARD)
        .stroke(Stroke::new(1.0, BORDER))
        .corner_radius(CornerRadius::same(12))
        .inner_margin(Margin::symmetric(18, 16))
        .show(ui, |ui| {
            ui.set_width((outer - 36.0).max(160.0));
            add(ui)
        });

    // Vis de châssis studio aux 4 coins
    let rect = frame_response.response.rect;
    let painter = ui.painter();
    for corner in [
        egui::pos2(rect.left() + 7.0, rect.top() + 7.0),
        egui::pos2(rect.right() - 7.0, rect.top() + 7.0),
        egui::pos2(rect.left() + 7.0, rect.bottom() - 7.0),
        egui::pos2(rect.right() - 7.0, rect.bottom() - 7.0),
    ] {
        painter.circle_filled(corner, 2.5, Color32::from_rgb(0x1E, 0x27, 0x38));
        painter.circle_stroke(corner, 2.5, Stroke::new(0.5, BORDER));
        painter.line_segment(
            [corner + Vec2::new(-1.2, 0.0), corner + Vec2::new(1.2, 0.0)],
            Stroke::new(0.6, Color32::from_rgb(0x3A, 0x48, 0x60)),
        );
    }

    frame_response.inner
}

fn step(ui: &mut egui::Ui, num: &str, title: &str) {
    ui.horizontal(|ui| {
        egui::Frame::default()
            .fill(ACCENT_BLUE_SOFT)
            .stroke(Stroke::new(1.0, ACCENT_BLUE))
            .corner_radius(CornerRadius::same(4))
            .inner_margin(Margin::symmetric(5, 2))
            .show(ui, |ui| {
                ui.label(
                    RichText::new(num)
                        .size(11.0)
                        .color(ACCENT_BLUE)
                        .strong()
                        .family(FontFamily::Monospace),
                );
            });
        ui.add_space(4.0);
        ui.label(
            RichText::new(title)
                .size(12.0)
                .color(TEXT)
                .strong()
                .family(FontFamily::Proportional),
        );
    });
    ui.add_space(8.0);
}

fn chip(ui: &mut egui::Ui, selected: bool, text: &str) -> egui::Response {
    let (fill, color, stroke) = if selected {
        (
            ACCENT_BLUE_SOFT,
            Color32::from_rgb(147, 197, 253),
            Stroke::new(1.5, ACCENT_BLUE),
        )
    } else {
        (CARD_SOFT, DIM, Stroke::new(1.0, BORDER))
    };
    ui.add(
        egui::Button::new(RichText::new(text).size(13.5).color(color).strong())
            .fill(fill)
            .stroke(stroke)
            .corner_radius(CornerRadius::same(8))
            .min_size(Vec2::new(0.0, 34.0)),
    )
}

fn ghost_button(text: &str) -> egui::Button<'static> {
    egui::Button::new(RichText::new(text).size(12.5).color(DIM))
        .fill(Color32::from_rgb(0x14, 0x1A, 0x28))
        .stroke(Stroke::new(1.0, BORDER))
        .corner_radius(CornerRadius::same(6))
}

/// Bouton lecture / pause rond style studio transport.
fn play_button(ui: &mut egui::Ui, playing: bool) -> egui::Response {
    let (rect, response) =
        ui.allocate_exact_size(Vec2::splat(36.0), egui::Sense::click());
    let fill = if response.hovered() {
        Color32::from_rgb(0x3B, 0x82, 0xF6)
    } else {
        ACCENT_BLUE
    };
    let painter = ui.painter();
    painter.circle_filled(rect.center(), 18.0, fill);
    painter.circle_stroke(
        rect.center(),
        18.0,
        Stroke::new(1.0, Color32::from_rgb(0x60, 0xA5, 0xFA)),
    );
    let center = rect.center();
    if playing {
        for dx in [-3.5, 3.5] {
            painter.rect_filled(
                egui::Rect::from_center_size(center + Vec2::new(dx, 0.0), Vec2::new(3.5, 12.0)),
                1.0,
                Color32::WHITE,
            );
        }
    } else {
        painter.add(egui::Shape::convex_polygon(
            vec![
                center + Vec2::new(-4.0, -6.5),
                center + Vec2::new(-4.0, 6.5),
                center + Vec2::new(7.0, 0.0),
            ],
            Color32::WHITE,
            Stroke::NONE,
        ));
    }
    response.on_hover_cursor(egui::CursorIcon::PointingHand)
}

/// Barre de progression cliquable et glissable (renvoie la fraction visée).
fn seek_bar(ui: &mut egui::Ui, fraction: f32) -> Option<f32> {
    let width = ui.available_width();
    let (rect, response) =
        ui.allocate_exact_size(Vec2::new(width, 20.0), egui::Sense::click_and_drag());
    let fraction = fraction.clamp(0.0, 1.0);
    let track = egui::Rect::from_center_size(rect.center(), Vec2::new(rect.width(), 4.0));
    let painter = ui.painter();
    painter.rect_filled(track, 2.0, Color32::from_rgb(0x18, 0x22, 0x33));
    painter.rect_stroke(track, 2.0, Stroke::new(1.0, BORDER), egui::StrokeKind::Inside);
    let filled = egui::Rect::from_min_size(
        track.min,
        Vec2::new(track.width() * fraction, track.height()),
    );
    painter.rect_filled(filled, 2.0, ACCENT_BLUE);
    let knob_x = rect.left() + rect.width() * fraction;
    let radius = if response.hovered() || response.dragged() {
        6.5
    } else {
        5.0
    };
    painter.circle_filled(
        egui::pos2(knob_x.clamp(rect.left() + radius, rect.right() - radius), rect.center().y),
        radius,
        ACCENT_AMBER,
    );
    if (response.clicked() || response.dragged()) && rect.width() > 0.0 {
        if let Some(pos) = response.interact_pointer_pos() {
            return Some(((pos.x - rect.left()) / rect.width()).clamp(0.0, 1.0));
        }
    }
    None
}

/// Bouton principal pleine largeur, texte centré.
fn primary_button(ui: &mut egui::Ui, label: &str, enabled: bool) -> egui::Response {
    let (rect, response) =
        ui.allocate_exact_size(Vec2::new(ui.available_width(), 48.0), egui::Sense::click());
    let hovered = response.hovered() && enabled;
    let fill = if !enabled {
        CARD_SOFT
    } else if hovered {
        Color32::from_rgb(0x3B, 0x82, 0xF6)
    } else {
        ACCENT_BLUE
    };
    let painter = ui.painter();
    painter.rect_filled(rect, CornerRadius::same(10), fill);
    if enabled {
        painter.rect_stroke(
            rect,
            CornerRadius::same(10),
            Stroke::new(1.0, Color32::from_rgb(0x60, 0xA5, 0xFA)),
            egui::StrokeKind::Inside,
        );
    }
    painter.text(
        rect.center(),
        egui::Align2::CENTER_CENTER,
        label,
        FontId::new(15.0, FontFamily::Proportional),
        if enabled { Color32::WHITE } else { FAINT },
    );
    if enabled {
        response.on_hover_cursor(egui::CursorIcon::PointingHand)
    } else {
        response
    }
}

// ---------------------------------------------------------------------------
// Composant VU-Mètre Stéréo & Animation Réactive
// ---------------------------------------------------------------------------

fn db_to_frac(db: f32) -> f32 {
    // Échelle calibrée de -30 dB (0.0) à +3 dB (1.0)
    ((db + 30.0) / 33.0).clamp(0.0, 1.0)
}

fn draw_stereo_vu_meter(
    ui: &mut egui::Ui,
    vu: &VuState,
    playing: bool,
    time: f64,
) {
    let width = ui.available_width();
    let total_height = 84.0;
    let (rect, _response) =
        ui.allocate_exact_size(Vec2::new(width, total_height), egui::Sense::hover());
    let painter = ui.painter();

    // Fond du rack VU-mètre (châssis sombre encastré)
    painter.rect_filled(rect, CornerRadius::same(8), Color32::from_rgb(0x0C, 0x10, 0x1A));
    painter.rect_stroke(
        rect,
        CornerRadius::same(8),
        Stroke::new(1.0, BORDER),
        egui::StrokeKind::Inside,
    );

    // En-tête : Titre et indicateur de statut
    let header_y = rect.top() + 10.0;
    painter.text(
        egui::pos2(rect.left() + 12.0, header_y),
        egui::Align2::LEFT_CENTER,
        "VU-MÈTRE STÉRÉO RACK",
        FontId::new(10.0, FontFamily::Monospace),
        Color32::from_rgb(148, 163, 184),
    );

    let (status_text, status_color, status_dot) = if playing {
        ("SIGNAL ACTIF", Color32::from_rgb(34, 197, 94), Color32::from_rgb(34, 197, 94))
    } else {
        let breath = ((time * 2.5).sin() * 0.5 + 0.5) as f32;
        let amber_glow = Color32::from_rgba_unmultiplied(234, 88, 12, (150.0 + 100.0 * breath) as u8);
        ("VEILLEUSE REPOS", amber_glow, amber_glow)
    };
    painter.circle_filled(egui::pos2(rect.right() - 110.0, header_y), 3.0, status_dot);
    painter.text(
        egui::pos2(rect.right() - 102.0, header_y),
        egui::Align2::LEFT_CENTER,
        status_text,
        FontId::new(9.5, FontFamily::Monospace),
        status_color,
    );

    // Graduation dB
    let bar_left = rect.left() + 38.0;
    let bar_right = rect.right() - 65.0;
    let bar_width = (bar_right - bar_left).max(10.0);
    let scale_y = rect.top() + 25.0;

    // Graduations : -24, -18, -12, -6, -3, 0, PEAK (+3)
    let ticks = [
        (-24.0, "-24", FAINT),
        (-18.0, "-18", FAINT),
        (-12.0, "-12", DIM),
        (-6.0, "-6", ACCENT_BLUE),
        (-3.0, "-3", ACCENT_AMBER),
        (0.0, "0", ACCENT_AMBER),
        (3.0, "PEAK", DANGER),
    ];

    for (db, label, color) in ticks {
        let frac = db_to_frac(db);
        let x = bar_left + bar_width * frac;
        painter.line_segment(
            [egui::pos2(x, scale_y), egui::pos2(x, scale_y + 3.0)],
            Stroke::new(1.0, color),
        );
        painter.text(
            egui::pos2(x, scale_y - 2.0),
            egui::Align2::CENTER_BOTTOM,
            label,
            FontId::new(8.5, FontFamily::Monospace),
            color,
        );
    }

    // Fonction de tracé pour un canal (L ou R)
    let draw_channel = |y_center: f32, ch_label: &str, rms: f32, _peak: f32, peak_hold: f32| {
        painter.text(
            egui::pos2(rect.left() + 16.0, y_center),
            egui::Align2::LEFT_CENTER,
            ch_label,
            FontId::new(11.0, FontFamily::Monospace),
            Color32::from_rgb(203, 213, 225),
        );

        let seg_count = 32;
        let spacing = 2.0;
        let seg_width =
            ((bar_width - (seg_count as f32 - 1.0) * spacing) / seg_count as f32).max(1.0);
        let seg_height = 10.0;
        let seg_y = y_center - seg_height / 2.0;

        let db = if rms < 0.0001 { -60.0 } else { 20.0 * rms.log10() };
        let rms_frac = if playing { db_to_frac(db) } else { 0.0 };
        let peak_db = if peak_hold < 0.0001 { -60.0 } else { 20.0 * peak_hold.log10() };
        let peak_frac = if playing { db_to_frac(peak_db) } else { 0.0 };

        let breath = ((time * 2.5).sin() * 0.5 + 0.5) as f32;

        for s in 0..seg_count {
            let s_frac = (s as f32 + 0.5) / seg_count as f32;
            let sx = bar_left + s as f32 * (seg_width + spacing);
            let srect = egui::Rect::from_min_size(
                egui::pos2(sx, seg_y),
                Vec2::new(seg_width, seg_height),
            );

            let color = if playing {
                let is_lit = s_frac <= rms_frac;
                let is_peak_needle = (s_frac - peak_frac).abs() < (0.8 / seg_count as f32);

                if is_lit || is_peak_needle {
                    if s_frac <= 0.73 {
                        ACCENT_BLUE
                    } else if s_frac <= 0.91 {
                        ACCENT_AMBER
                    } else {
                        DANGER
                    }
                } else {
                    Color32::from_rgb(0x13, 0x1A, 0x27)
                }
            } else {
                // Veilleuse repos : les 3 premiers segments pulsent doucement en ambre
                if s < 3 {
                    Color32::from_rgba_unmultiplied(
                        234,
                        88,
                        12,
                        (30.0 + 40.0 * breath * (3 - s) as f32 / 3.0) as u8,
                    )
                } else {
                    Color32::from_rgb(0x13, 0x1A, 0x27)
                }
            };

            painter.rect_filled(srect, CornerRadius::same(1), color);
        }

        // Valeur dB à droite
        let (val_str, val_col) = if playing {
            if db <= -55.0 {
                ("-∞ dB".to_string(), FAINT)
            } else {
                (
                    format!("{:+.1} dB", db),
                    if db > 0.0 {
                        DANGER
                    } else if db > -6.0 {
                        ACCENT_AMBER
                    } else {
                        TEXT
                    },
                )
            }
        } else {
            let alpha = (120.0 + 80.0 * breath) as u8;
            ("REPOS".to_string(), Color32::from_rgba_unmultiplied(234, 88, 12, alpha))
        };

        painter.text(
            egui::pos2(rect.right() - 14.0, y_center),
            egui::Align2::RIGHT_CENTER,
            val_str,
            FontId::new(10.0, FontFamily::Monospace),
            val_col,
        );
    };

    draw_channel(rect.top() + 45.0, "CH L", vu.l_rms, vu.l_peak, vu.l_peak_hold);
    draw_channel(rect.top() + 66.0, "CH R", vu.r_rms, vu.r_peak, vu.r_peak_hold);
}

fn draw_encoding_animation(
    ui: &mut egui::Ui,
    pct: u32,
    elapsed: f64,
    eta: Option<f64>,
    time: f64,
    on_cancel: impl FnOnce(),
) {
    let width = ui.available_width();
    let chassis_height = 188.0;
    let (rect, _response) =
        ui.allocate_exact_size(Vec2::new(width, chassis_height), egui::Sense::hover());
    let painter = ui.painter();

    // Fond console d'encodage
    painter.rect_filled(rect, CornerRadius::same(12), Color32::from_rgb(0x08, 0x0C, 0x14));
    painter.rect_stroke(
        rect,
        CornerRadius::same(12),
        Stroke::new(1.0, Color32::from_rgb(0x23, 0x30, 0x46)),
        egui::StrokeKind::Inside,
    );

    // 1. En-tête : "STUDIO ENCODER" + voyant REC clignotant + grand pourcentage
    let blink = (time * 3.0).fract() < 0.5;
    let rec_color = if blink {
        DANGER
    } else {
        Color32::from_rgb(0x40, 0x15, 0x15)
    };
    painter.circle_filled(egui::pos2(rect.left() + 18.0, rect.top() + 20.0), 4.5, rec_color);

    painter.text(
        egui::pos2(rect.left() + 28.0, rect.top() + 20.0),
        egui::Align2::LEFT_CENTER,
        "STUDIO ENCODER · H.264 / AAC 192K",
        FontId::new(11.0, FontFamily::Monospace),
        Color32::from_rgb(180, 195, 215),
    );

    painter.text(
        egui::pos2(rect.right() - 18.0, rect.top() + 20.0),
        egui::Align2::RIGHT_CENTER,
        format!("{:2} %", pct),
        FontId::new(20.0, FontFamily::Monospace),
        ACCENT_AMBER,
    );

    // 2. Écran oscilloscope & spectrogramme réactif
    let disp_rect = egui::Rect::from_min_max(
        egui::pos2(rect.left() + 14.0, rect.top() + 38.0),
        egui::pos2(rect.right() - 14.0, rect.top() + 118.0),
    );
    painter.rect_filled(disp_rect, CornerRadius::same(6), Color32::from_rgb(0x05, 0x08, 0x0E));
    painter.rect_stroke(
        disp_rect,
        CornerRadius::same(6),
        Stroke::new(1.0, Color32::from_rgb(0x18, 0x22, 0x34)),
        egui::StrokeKind::Inside,
    );

    // Réticule de l'oscilloscope
    let cy = disp_rect.center().y;
    painter.line_segment(
        [egui::pos2(disp_rect.left(), cy), egui::pos2(disp_rect.right(), cy)],
        Stroke::new(0.8, Color32::from_rgba_unmultiplied(37, 99, 235, 35)),
    );
    for dy in [-20.0, 20.0] {
        painter.line_segment(
            [egui::pos2(disp_rect.left(), cy + dy), egui::pos2(disp_rect.right(), cy + dy)],
            Stroke::new(0.5, Color32::from_rgba_unmultiplied(37, 99, 235, 18)),
        );
    }

    // Barres de spectre VU-mètre pulsant (28 barres)
    let num_bars = 28;
    let b_spacing = 3.0;
    let total_b_spacing = (num_bars as f32 - 1.0) * b_spacing;
    let bar_w = ((disp_rect.width() - 16.0 - total_b_spacing) / num_bars as f32).max(2.0);
    let start_x = disp_rect.left() + 8.0;

    let bounce = ((time * 5.0).sin().abs()).powi(2) as f32;
    let pct_factor = 0.35 + 0.65 * (pct as f32 / 100.0);

    for i in 0..num_bars {
        let f1 = ((time * 8.0 + i as f64 * 0.45).sin() * 0.5 + 0.5) as f32;
        let f2 = ((time * 14.0 - i as f64 * 0.7).cos() * 0.5 + 0.5) as f32;
        let f3 = ((time * 3.8 + i as f64 * 0.2).sin() * 0.5 + 0.5) as f32;

        let val = ((0.35 * f1 + 0.40 * f2 + 0.25 * f3) * (0.6 + 0.4 * bounce) * pct_factor)
            .clamp(0.08, 0.98);
        let bh = val * (disp_rect.height() - 10.0);
        let bx = start_x + i as f32 * (bar_w + b_spacing);
        let brect = egui::Rect::from_min_max(
            egui::pos2(bx, disp_rect.bottom() - 4.0 - bh),
            egui::pos2(bx + bar_w, disp_rect.bottom() - 4.0),
        );

        let bar_col = if val < 0.50 {
            ACCENT_BLUE
        } else if val < 0.78 {
            Color32::from_rgb(0x63, 0x66, 0xF1) // Indigo réactif
        } else {
            ACCENT_AMBER
        };
        painter.rect_filled(brect, CornerRadius::same(1), bar_col);

        let cap_y = (disp_rect.bottom() - 4.0 - bh - 2.5).max(disp_rect.top() + 4.0);
        painter.rect_filled(
            egui::Rect::from_min_size(egui::pos2(bx, cap_y), Vec2::new(bar_w, 1.8)),
            CornerRadius::ZERO,
            Color32::from_rgb(254, 215, 170),
        );
    }

    // Trace neon d'oscilloscope en surimpression
    let wave_steps = 40;
    let step_dx = disp_rect.width() / wave_steps as f32;
    let mut prev_pt = egui::pos2(
        disp_rect.left(),
        cy + ((time * 16.0).sin() * (9.0 + 6.0 * bounce as f64) * pct_factor as f64) as f32,
    );

    for s in 1..=wave_steps {
        let px = disp_rect.left() + s as f32 * step_dx;
        let py = cy
            + ((px as f64 * 0.04 + time * 16.0).sin()
                * (9.0 + 6.0 * bounce as f64)
                * pct_factor as f64) as f32;
        let pt = egui::pos2(px, py.clamp(disp_rect.top() + 4.0, disp_rect.bottom() - 4.0));
        painter.line_segment(
            [prev_pt, pt],
            Stroke::new(1.8, Color32::from_rgba_unmultiplied(56, 189, 248, 180)),
        );
        prev_pt = pt;
    }

    // 3. Barre de progression studio avec tête de balayage lumineuse
    let pbar_y = rect.top() + 128.0;
    let pbar_h = 8.0;
    let pbar_track = egui::Rect::from_min_max(
        egui::pos2(rect.left() + 14.0, pbar_y),
        egui::pos2(rect.right() - 14.0, pbar_y + pbar_h),
    );
    painter.rect_filled(pbar_track, CornerRadius::same(4), Color32::from_rgb(0x13, 0x1B, 0x29));
    painter.rect_stroke(
        pbar_track,
        CornerRadius::same(4),
        Stroke::new(1.0, BORDER),
        egui::StrokeKind::Inside,
    );

    let fill_w = pbar_track.width() * (pct as f32 / 100.0).clamp(0.0, 1.0);
    if fill_w > 0.0 {
        let fill_rect = egui::Rect::from_min_max(
            pbar_track.min,
            egui::pos2(pbar_track.left() + fill_w, pbar_track.bottom()),
        );
        painter.rect_filled(fill_rect, CornerRadius::same(4), ACCENT_BLUE);

        // Tête lumineuse ambrée au bout du curseur
        let head_x = pbar_track.left() + fill_w;
        let head_rect = egui::Rect::from_center_size(
            egui::pos2(head_x, pbar_track.center().y),
            Vec2::new(4.0, 12.0),
        );
        painter.rect_filled(head_rect, CornerRadius::same(2), ACCENT_AMBER);
    }

    // 4. Ligne inférieure : Temps écoulé / ETA et bouton d'annulation
    let footer_y = rect.top() + 158.0;
    let eta_str = match eta {
        Some(s) => format!("reste ~{}", job::clock(s)),
        None => "calcul de l'estimation...".to_string(),
    };
    let time_info = format!("Écoulé : {} · {}", job::clock(elapsed), eta_str);
    painter.text(
        egui::pos2(rect.left() + 14.0, footer_y),
        egui::Align2::LEFT_CENTER,
        time_info,
        FontId::new(11.5, FontFamily::Monospace),
        DIM,
    );

    // Bouton Annuler
    let cancel_btn_rect = egui::Rect::from_min_size(
        egui::pos2(rect.right() - 100.0, footer_y - 14.0),
        Vec2::new(86.0, 26.0),
    );
    let cancel_resp = ui.interact(
        cancel_btn_rect,
        ui.scope_id().with("cancel_encoding_btn"),
        egui::Sense::click(),
    );
    let cancel_bg = if cancel_resp.hovered() {
        Color32::from_rgb(0x3B, 0x1A, 0x1C)
    } else {
        Color32::from_rgb(0x1B, 0x15, 0x1A)
    };
    painter.rect_filled(cancel_btn_rect, CornerRadius::same(6), cancel_bg);
    painter.rect_stroke(
        cancel_btn_rect,
        CornerRadius::same(6),
        Stroke::new(1.0, Color32::from_rgb(0x5A, 0x2E, 0x30)),
        egui::StrokeKind::Inside,
    );
    painter.text(
        cancel_btn_rect.center(),
        egui::Align2::CENTER_CENTER,
        "Annuler",
        FontId::new(11.5, FontFamily::Proportional),
        Color32::from_rgb(248, 113, 113),
    );
    if cancel_resp.clicked() {
        on_cancel();
    }
}

// ---------------------------------------------------------------------------
// Application
// ---------------------------------------------------------------------------

impl eframe::App for App {
    fn ui(&mut self, ui: &mut egui::Ui, _frame: &mut eframe::Frame) {
        let ctx = ui.ctx().clone();
        self.poll_job(&ctx);

        // Lecteur audio : alimente la file et rafraîchit le VU-mètre
        let mut playing = false;
        if let Some(audio) = self.audio.as_mut() {
            if let Some(player) = audio.player.as_mut() {
                player.poll();
                if player.is_playing() {
                    playing = true;
                    let raw = player.levels(2048);
                    let attack = 0.40;
                    let decay = 0.15;
                    self.vu.l_rms += (raw.left_rms - self.vu.l_rms)
                        * (if raw.left_rms > self.vu.l_rms {
                            attack
                        } else {
                            decay
                        });
                    self.vu.r_rms += (raw.right_rms - self.vu.r_rms)
                        * (if raw.right_rms > self.vu.r_rms {
                            attack
                        } else {
                            decay
                        });
                    self.vu.l_db = raw.left_db;
                    self.vu.r_db = raw.right_db;
                    self.vu.l_peak += (raw.left_peak - self.vu.l_peak)
                        * (if raw.left_peak > self.vu.l_peak {
                            0.6
                        } else {
                            0.2
                        });
                    self.vu.r_peak += (raw.right_peak - self.vu.r_peak)
                        * (if raw.right_peak > self.vu.r_peak {
                            0.6
                        } else {
                            0.2
                        });

                    if self.vu.l_peak > self.vu.l_peak_hold {
                        self.vu.l_peak_hold = self.vu.l_peak;
                    } else {
                        self.vu.l_peak_hold = (self.vu.l_peak_hold * 0.96).max(self.vu.l_peak);
                    }
                    if self.vu.r_peak > self.vu.r_peak_hold {
                        self.vu.r_peak_hold = self.vu.r_peak;
                    } else {
                        self.vu.r_peak_hold = (self.vu.r_peak_hold * 0.96).max(self.vu.r_peak);
                    }
                } else {
                    self.vu.l_rms *= 0.90;
                    self.vu.r_rms *= 0.90;
                    self.vu.l_db = -60.0;
                    self.vu.r_db = -60.0;
                    self.vu.l_peak *= 0.90;
                    self.vu.r_peak *= 0.90;
                    self.vu.l_peak_hold *= 0.90;
                    self.vu.r_peak_hold *= 0.90;
                }
            }
        }

        let is_encoding = self.job.is_some();
        if playing || is_encoding {
            ctx.request_repaint_after(Duration::from_millis(33)); // ~30 fps réactif
        } else {
            ctx.request_repaint_after(Duration::from_millis(80)); // veilleuse repos fluide
        }

        // Glisser-déposer
        let dropped = ctx.input(|i| i.raw.dropped_files.clone());
        for file in dropped {
            let path = file.path().to_path_buf();
            if path.as_os_str().is_empty() || !path.exists() {
                if let Ok(bytes) = file.bytes() {
                    self.load_visual_bytes(&ctx, &bytes, "");
                }
            } else {
                self.accept_path(&ctx, path);
            }
        }
        self.drag_hover = ctx.input(|i| !i.raw.hovered_files.is_empty());

        // Ctrl+V
        if ctx.input(|i| i.key_pressed(egui::Key::V) && i.modifiers.command) {
            self.paste(&ctx);
        }

        // Espace : lecture / pause de l'aperçu
        if ctx.input(|i| i.key_pressed(egui::Key::Space)) && !ctx.egui_wants_keyboard_input() {
            if let Some(audio) = self.audio.as_mut() {
                if let Some(player) = audio.player.as_mut() {
                    player.toggle();
                }
            }
        }

        egui::CentralPanel::default()
            .frame(egui::Frame::default().fill(BG).inner_margin(Margin::symmetric(20, 24)))
            .show(ui, |ui| {
                let outer = ui.available_width();
                let col = (outer - 8.0).min(640.0).max(280.0);
                let offset = ((outer - col) / 2.0).max(0.0);
                egui::ScrollArea::vertical().show(ui, |ui| {
                    ui.horizontal_top(|ui| {
                        ui.add_space(offset);
                        ui.allocate_ui_with_layout(
                            Vec2::new(col, 0.0),
                            Layout::top_down(Align::Min),
                            |ui| {
                                self.header(ui);
                                ui.add_space(20.0);
                                self.audio_card(ui);
                                ui.add_space(12.0);
                                self.visual_card(&ctx, ui);
                                ui.add_space(12.0);
                                self.settings_card(ui);
                                ui.add_space(18.0);
                                self.action_area(ui);
                                ui.add_space(16.0);
                                ui.label(
                                    RichText::new(
                                        "ZEEKS Studio Rack · Rendu H.264 + AAC 100 % local · Aucune dépendance externe",
                                    )
                                    .size(11.5)
                                    .color(FAINT),
                                );
                                ui.add_space(14.0);
                            },
                        );
                    });
                });
            });

        if self.drag_hover {
            let rect = ctx.content_rect();
            let painter = ctx.layer_painter(egui::LayerId::new(
                egui::Order::Foreground,
                egui::Id::unique("drop_overlay"),
            ));
            painter.rect_filled(rect, 0.0, Color32::from_rgba_unmultiplied(11, 15, 25, 235));
            painter.text(
                rect.center(),
                egui::Align2::CENTER_CENTER,
                "Dépose ton fichier audio ou image ici · ZEEKS",
                FontId::new(20.0, FontFamily::Proportional),
                TEXT,
            );
        }
    }
}

impl App {
    fn header(&mut self, ui: &mut egui::Ui) {
        ui.horizontal(|ui| {
            // Logo officiel ZEEKS intégré
            ui.add(
                egui::Image::new(&self.logo)
                    .fit_to_exact_size(Vec2::new(126.0, 48.0))
                    .corner_radius(CornerRadius::same(6)),
            );
            ui.add_space(14.0);
            ui.vertical(|ui| {
                ui.horizontal(|ui| {
                    ui.label(
                        RichText::new("ZEEKS")
                            .size(23.0)
                            .color(TEXT)
                            .strong(),
                    );
                    ui.add_space(6.0);
                    egui::Frame::default()
                        .fill(ACCENT_BLUE_SOFT)
                        .stroke(Stroke::new(1.0, ACCENT_BLUE))
                        .corner_radius(CornerRadius::same(4))
                        .inner_margin(Margin::symmetric(6, 2))
                        .show(ui, |ui| {
                            ui.label(
                                RichText::new("STUDIO RACK v0.2.0")
                                    .size(10.0)
                                    .color(Color32::from_rgb(147, 197, 253))
                                    .strong()
                                    .family(FontFamily::Monospace),
                            );
                        });
                });
                ui.add_space(2.0);
                ui.label(
                    RichText::new("Convertisseur Audio → Vidéo MP4 · Moteur Studio 100 % Local")
                        .size(12.5)
                        .color(DIM),
                );
            });
        });
    }

    fn audio_card(&mut self, ui: &mut egui::Ui) {
        let mut remove = false;
        let mut toggle = false;
        let mut seek_to: Option<f64> = None;
        let current_time = ui.ctx().input(|i| i.time);

        card(ui, |ui| {
            step(ui, "01", "AUDIO · RACK D'ÉCOUTE & VU-MÈTRE STÉRÉO");
            if let Some(audio) = &self.audio {
                ui.horizontal(|ui| {
                    ui.vertical(|ui| {
                        ui.label(RichText::new(&audio.name).size(14.5).color(TEXT).strong());
                        ui.add_space(2.0);
                        ui.label(
                            RichText::new(format!(
                                "{} · {} · Master AAC 192 kb/s",
                                job::human_duration(audio.duration),
                                job::human_size(audio.size)
                            ))
                            .size(12.0)
                            .color(DIM),
                        );
                    });
                    ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                        if ui.add(ghost_button("Retirer")).clicked() {
                            remove = true;
                        }
                    });
                });
                ui.add_space(10.0);
                match (&audio.player, &audio.player_error) {
                    (Some(player), _) => {
                        let duration = player.duration().max(0.001);
                        let position = player.position();
                        let playing = player.is_playing();
                        ui.horizontal(|ui| {
                            if play_button(ui, playing).clicked() {
                                toggle = true;
                            }
                            ui.add_space(8.0);
                            let label = format!(
                                "{} / {}",
                                job::clock(position),
                                job::clock(duration)
                            );
                            let bar_width = (ui.available_width() - 118.0).max(60.0);
                            let mut target = None;
                            ui.allocate_ui_with_layout(
                                Vec2::new(bar_width, 20.0),
                                Layout::left_to_right(Align::Center),
                                |ui| {
                                    target = seek_bar(ui, (position / duration) as f32);
                                },
                            );
                            if let Some(f) = target {
                                seek_to = Some(f as f64 * duration);
                            }
                            ui.label(
                                RichText::new(label)
                                    .size(11.5)
                                    .color(DIM)
                                    .family(FontFamily::Monospace),
                            );
                        });
                        ui.add_space(12.0);
                        draw_stereo_vu_meter(ui, &self.vu, playing, current_time);
                    }
                    (None, Some(error)) => {
                        ui.label(
                            RichText::new(format!("Lecture indisponible : {error}"))
                                .size(11.5)
                                .color(FAINT),
                        );
                        ui.add_space(10.0);
                        draw_stereo_vu_meter(ui, &self.vu, false, current_time);
                    }
                    _ => {
                        ui.add_space(10.0);
                        draw_stereo_vu_meter(ui, &self.vu, false, current_time);
                    }
                }
            } else {
                egui::Frame::default()
                    .fill(CARD_SOFT)
                    .stroke(Stroke::new(1.0, BORDER))
                    .corner_radius(CornerRadius::same(10))
                    .inner_margin(Margin::symmetric(16, 20))
                    .show(ui, |ui| {
                        ui.vertical_centered(|ui| {
                            ui.label(
                                RichText::new("Dépose un fichier audio (MP3, WAV, FLAC, M4A...) ou")
                                    .size(12.5)
                                    .color(DIM),
                            );
                            ui.add_space(10.0);
                            if ui.button("Choisir un fichier audio").clicked() {
                                if let Some(p) = rfd::FileDialog::new()
                                    .add_filter("Audio", visual::AUDIO_EXTS)
                                    .pick_file()
                                {
                                    self.set_audio(p);
                                }
                            }
                        });
                    });
                ui.add_space(10.0);
                draw_stereo_vu_meter(ui, &self.vu, false, current_time);
            }
        });
        if remove {
            self.audio = None;
            self.result = None;
        }
        if let Some(audio) = self.audio.as_mut() {
            if let Some(player) = audio.player.as_mut() {
                if toggle {
                    player.toggle();
                }
                if let Some(seconds) = seek_to {
                    player.seek(seconds);
                }
            }
        }
    }

    fn visual_card(&mut self, ctx: &egui::Context, ui: &mut egui::Ui) {
        let mut remove = false;
        card(ui, |ui| {
            step(ui, "02", "VISUEL · IMAGE, GIF OU CLIP DE FOND");
            if let Some(vis) = &self.visual {
                ui.horizontal(|ui| {
                    ui.add(
                        egui::Image::new(&vis.texture)
                            .fit_to_exact_size(Vec2::new(112.0, 63.0))
                            .corner_radius(CornerRadius::same(8)),
                    );
                    ui.vertical(|ui| {
                        ui.label(RichText::new(&vis.loaded.label).size(13.0).color(TEXT));
                        ui.add_space(2.0);
                        ui.label(
                            RichText::new("Boucle automatiquement pendant toute la durée audio")
                                .size(11.5)
                                .color(DIM),
                        );
                    });
                    ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                        if ui.add(ghost_button("Retirer")).clicked() {
                            remove = true;
                        }
                    });
                });
            } else {
                ui.horizontal(|ui| {
                    if ui.button("Choisir un fichier").clicked() {
                        if let Some(p) = rfd::FileDialog::new()
                            .add_filter(
                                "Images",
                                &["jpg", "jpeg", "png", "apng", "gif", "webp", "bmp", "tiff"],
                            )
                            .add_filter("Vidéos", visual::VIDEO_EXTS)
                            .pick_file()
                        {
                            self.load_visual_path(ctx, p);
                        }
                    }
                    if ui.button("Coller (Ctrl+V)").clicked() {
                        self.paste(ctx);
                    }
                    if ui.button("Depuis une URL").clicked() {
                        self.show_url = !self.show_url;
                    }
                });
                if self.show_url {
                    ui.add_space(8.0);
                    ui.horizontal(|ui| {
                        let field = ui.add_sized(
                            [ui.available_width() - 96.0, 32.0],
                            egui::TextEdit::singleline(&mut self.url)
                                .hint_text("https://…/image.jpg")
                                .margin(Margin::symmetric(10, 8)),
                        );
                        let entered =
                            field.lost_focus() && ui.input(|i| i.key_pressed(egui::Key::Enter));
                        if ui.button("Charger").clicked() || entered {
                            self.load_url(ctx);
                        }
                    });
                }
                ui.add_space(2.0);
                ui.label(
                    RichText::new("JPG, PNG, GIF, APNG, WebP — ou un clip MP4/WebM")
                        .size(11.5)
                        .color(FAINT),
                );
            }
        });
        if remove {
            self.visual = None;
            self.result = None;
        }
    }

    fn settings_card(&mut self, ui: &mut egui::Ui) {
        card(ui, |ui| {
            step(ui, "03", "FORMAT · RÉSOLUTION");
            ui.horizontal(|ui| {
                for f in [Format::Wide, Format::Tall, Format::Square] {
                    if chip(ui, self.format == f, f.label()).clicked() {
                        self.format = f;
                    }
                }
                ui.add_space(6.0);
                ui.label(RichText::new(self.format.hint()).size(12.0).color(DIM));
            });

            ui.add_space(16.0);
            step(ui, "04", "CADRAGE");
            ui.horizontal(|ui| {
                for f in [Fit::Fill, Fit::Contain, Fit::Blur] {
                    if chip(ui, self.fit == f, f.label()).clicked() {
                        self.fit = f;
                    }
                }
            });
            ui.label(RichText::new(self.fit.hint()).size(12.0).color(DIM));

            ui.add_space(16.0);
            step(ui, "05", "QUALITÉ D'ENCODAGE");
            ui.horizontal(|ui| {
                for q in [Quality::Light, Quality::Standard, Quality::High] {
                    if chip(ui, self.quality == q, q.label()).clicked() {
                        self.quality = q;
                    }
                }
            });
            ui.label(
                RichText::new("Débit vidéo Studio : 4, 8 ou 16 Mb/s (1080p)")
                    .size(12.0)
                    .color(DIM),
            );
        });
    }

    fn action_area(&mut self, ui: &mut egui::Ui) {
        let current_time = ui.ctx().input(|i| i.time);
        if let Some(progress) = self.job.clone() {
            let pct = progress.percent.load(Ordering::Relaxed);
            let elapsed = self.started.map(|s| s.elapsed().as_secs_f64()).unwrap_or(0.0);
            let eta = if pct >= 3 {
                Some((elapsed / (pct as f64 / 100.0) - elapsed).max(0.0))
            } else {
                None
            };
            draw_encoding_animation(ui, pct, elapsed, eta, current_time, || {
                progress.cancel.store(true, Ordering::Relaxed);
            });
            return;
        }

        if let Some(result) = self.result.clone() {
            egui::Frame::default()
                .fill(Color32::from_rgb(12, 30, 22))
                .stroke(Stroke::new(1.0, Color32::from_rgb(34, 197, 94)))
                .corner_radius(CornerRadius::same(12))
                .inner_margin(Margin::symmetric(18, 16))
                .show(ui, |ui| {
                    ui.label(
                        RichText::new("✓ VIDÉO PRÊTE · EXPORT TERMINÉ")
                            .size(14.5)
                            .color(OK)
                            .strong(),
                    );
                    ui.add_space(4.0);
                    ui.label(
                        RichText::new(format!(
                            "{} · musique de {} · encodé en {:.1} s",
                            job::human_size(result.bytes),
                            job::human_duration(result.seconds),
                            result.elapsed
                        ))
                        .size(12.5)
                        .color(TEXT),
                    );
                    ui.add_space(2.0);
                    ui.label(
                        RichText::new(result.output.display().to_string())
                            .size(11.5)
                            .color(DIM),
                    );
                });
            ui.add_space(10.0);
            ui.horizontal(|ui| {
                if ui.button("Lire la vidéo").clicked() {
                    open_file(&result.output);
                }
                if ui.button("Ouvrir le dossier").clicked() {
                    reveal_file(&result.output);
                }
                if ui.add(ghost_button("Nouveau projet")).clicked() {
                    self.result = None;
                }
            });
            return;
        }

        let ready = self.audio.is_some() && self.visual.is_some();
        if primary_button(ui, "GÉNÉRER LE MP4 (STUDIO RENDER)", ready).clicked() && ready {
            self.start_job();
        }
        if !ready {
            ui.add_space(6.0);
            ui.label(
                RichText::new(
                    "Ajoute un fichier audio et une image/vidéo pour activer le rendu MP4.",
                )
                .size(11.5)
                .color(FAINT),
            );
        }

        if let Some(err) = &self.error {
            ui.add_space(12.0);
            egui::Frame::default()
                .fill(Color32::from_rgb(36, 18, 20))
                .stroke(Stroke::new(1.0, DANGER))
                .corner_radius(CornerRadius::same(10))
                .inner_margin(Margin::symmetric(14, 11))
                .show(ui, |ui| {
                    ui.label(RichText::new(err).size(12.5).color(DANGER));
                });
        }
    }
}

fn open_file(path: &Path) {
    let _ = std::process::Command::new("cmd")
        .args(["/C", "start", ""])
        .arg(path)
        .spawn();
}

fn reveal_file(path: &Path) {
    let _ = std::process::Command::new("explorer")
        .arg("/select,")
        .arg(path)
        .spawn();
}

fn main() -> eframe::Result<()> {
    // Rendu net sur les écrans à mise à l'échelle (125 %, 150 %...) : à faire avant toute fenêtre.
    unsafe {
        use windows::Win32::UI::HiDpi::{
            SetProcessDpiAwarenessContext, DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2,
        };
        let _ = SetProcessDpiAwarenessContext(DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2);
    }
    let args: Vec<String> = std::env::args().skip(1).collect();
    if args.first().map(|a| a == "--convert").unwrap_or(false) {
        std::process::exit(run_cli(&args));
    }
    // Fichiers passés en argument (glisser sur l'icône de l'exe).
    let pending: Vec<PathBuf> = args
        .iter()
        .filter(|a| !a.starts_with("--"))
        .map(PathBuf::from)
        .filter(|p| p.exists())
        .collect();
    let mut viewport = egui::ViewportBuilder::default()
        .with_inner_size([720.0, 960.0])
        .with_min_inner_size([560.0, 620.0])
        .with_title("ZEEKS · Audio → Vidéo")
        .with_app_id("zeeks");
    if let Some(icon) = window_icon() {
        viewport = viewport.with_icon(Arc::new(icon));
    }
    let options = eframe::NativeOptions {
        viewport,
        ..Default::default()
    };
    eframe::run_native(
        "ZEEKS · Audio → Vidéo",
        options,
        Box::new(move |cc| {
            let mut app = App::new(cc);
            for path in pending {
                app.accept_path(&cc.egui_ctx, path);
            }
            Ok(Box::new(app))
        }),
    )
}

fn window_icon() -> Option<egui::IconData> {
    let bytes = include_bytes!("../assets/icon.png");
    let img = image::load_from_memory(bytes).ok()?.to_rgba8();
    let (width, height) = img.dimensions();
    Some(egui::IconData {
        rgba: img.into_raw(),
        width,
        height,
    })
}

/// Mode automatisation : `--convert --audio A --visual V --out O [--format 9:16] [--fit blur] [--quality high]`
fn run_cli(args: &[String]) -> i32 {
    let mut audio: Option<PathBuf> = None;
    let mut visual_path: Option<PathBuf> = None;
    let mut out: Option<PathBuf> = None;
    let mut format = Format::Wide;
    let mut fit = Fit::Fill;
    let mut quality = Quality::Standard;
    let mut log_path: Option<PathBuf> = None;

    let mut i = 1;
    while i < args.len() {
        let value = args.get(i + 1).cloned().unwrap_or_default();
        match args[i].as_str() {
            "--audio" => audio = Some(PathBuf::from(&value)),
            "--visual" | "--image" => visual_path = Some(PathBuf::from(&value)),
            "--out" => out = Some(PathBuf::from(&value)),
            "--format" => {
                format = match value.as_str() {
                    "9:16" | "tall" => Format::Tall,
                    "1:1" | "square" => Format::Square,
                    _ => Format::Wide,
                }
            }
            "--fit" => {
                fit = match value.as_str() {
                    "contain" => Fit::Contain,
                    "blur" => Fit::Blur,
                    _ => Fit::Fill,
                }
            }
            "--quality" => {
                quality = match value.as_str() {
                    "light" => Quality::Light,
                    "high" => Quality::High,
                    _ => Quality::Standard,
                }
            }
            "--log" => log_path = Some(PathBuf::from(&value)),
            _ => {}
        }
        i += 2;
    }

    let mut log = String::new();
    let result: Result<Stats, String> = (|| {
        let audio = audio.ok_or_else(|| "--audio manquant".to_string())?;
        let visual_path = visual_path.ok_or_else(|| "--visual manquant".to_string())?;
        let out = out.ok_or_else(|| "--out manquant".to_string())?;
        let loaded = visual::load_path(&visual_path).map_err(|e| format!("{e:#}"))?;
        let (width, height) = format.dims();
        let spec = Spec {
            audio,
            visual: loaded.source,
            out,
            width,
            height,
            fps: 30,
            quality,
            fit,
        };
        job::run_blocking(&spec).map_err(|e| format!("{e:#}"))
    })();

    match &result {
        Ok(stats) => log.push_str(&format!(
            "OK {} octets, {} s de video, encodage {:.1} s (decode {:.1} / compose {:.1} / write {:.1}) -> {}\n",
            stats.bytes,
            stats.seconds,
            stats.elapsed,
            stats.t_decode,
            stats.t_compose,
            stats.t_write,
            stats.output.display()
        )),
        Err(e) => log.push_str(&format!("ERREUR: {e}\n")),
    }
    if let Some(path) = log_path {
        let _ = std::fs::write(path, &log);
    }
    if result.is_ok() {
        0
    } else {
        1
    }
}
