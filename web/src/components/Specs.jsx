import React from 'react';

const SPECS_DATA = [
  {
    id: 'SYS.ARCH',
    label: 'Architecture binaire',
    detail: 'Binaire portable x86_64 compilé en Rust (édition 2021). 11 Mo, zéro dépendance externe, aucun runtime ni installation requis.',
    tag: 'RUST NATIF'
  },
  {
    id: 'MEDIA.PIPE',
    label: 'Pipeline d\'encodage',
    detail: 'Accélération matérielle native via Windows Media Foundation (SinkWriter / IMFTransform). Encodage H.264 et AAC sans FFmpeg.',
    tag: 'HARDWARE WMF'
  },
  {
    id: 'RES.TARGET',
    label: 'Résolution & Débits',
    detail: 'Export jusqu\'à 1920×1080p à 60 fps avec débit adaptatif vidéo (jusqu\'à 12 Mbps) et audio AAC 320 kbps stéréo sans compression destructive.',
    tag: '1080P 60FPS'
  },
  {
    id: 'FRAME.RATIO',
    label: 'Formats & Cadrages',
    detail: '16:9 paysage (YouTube), 9:16 vertical (TikTok, Instagram Reels, Shorts) et 1:1 carré. Remplissage intelligent avec fond flou gaussien dynamique.',
    tag: '16:9 / 9:16 / 1:1'
  },
  {
    id: 'INPUT.AUDIO',
    label: 'Formats audio source',
    detail: 'Décodage multiformat universel : MP3, WAV (PCM 16/24/32-bit), FLAC sans perte, M4A/AAC, OGG Vorbis avec détection automatique du samplerate.',
    tag: 'LOSSLESS / PCM'
  },
  {
    id: 'INPUT.VISUAL',
    label: 'Formats visuels & Boucles',
    detail: 'Images fixes haute résolution (JPG, PNG transparent, WebP) et supports animés avec bouclage automatique transparent (GIF animés, vidéos MP4/MOV).',
    tag: 'STILL + LOOP'
  },
  {
    id: 'PRIVACY.IO',
    label: 'Confidentialité & Réseau',
    detail: 'Fonctionnement 100% hors-ligne. Aucun appel télémétrique, aucun upload de contenu sur des serveurs distants. Données strictement confinées au PC.',
    tag: '100% AIRGAPPED'
  }
];

export default function Specs() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-20 border-t border-white/10">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-500 mb-2 font-bold">
            <span>// 03: ARCHITECTURE & SPÉCIFICATIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
            Spécifications du moteur ZEEKS
          </h2>
        </div>
        <div className="text-xs font-mono text-slate-400 border border-white/15 px-3.5 py-2 bg-[#0E1017]">
          STATUS: PRODUCTION-READY
        </div>
      </div>

      {/* Structured Blueprint Table */}
      <div className="border border-white/15 bg-[#08090D] shadow-xl">
        {SPECS_DATA.map((item, index) => (
          <div
            key={item.id}
            className={`grid grid-cols-1 md:grid-cols-12 gap-5 p-6 items-baseline text-xs font-mono transition-colors hover:bg-white/[0.02] ${
              index !== SPECS_DATA.length - 1 ? 'border-b border-white/10' : ''
            }`}
          >
            {/* ID & Title */}
            <div className="md:col-span-4 flex items-baseline gap-3">
              <span className="text-slate-500 text-[11px] font-semibold">{item.id}</span>
              <span className="text-slate-200 font-bold text-sm tracking-wide">{item.label}</span>
            </div>

            {/* Description */}
            <div className="md:col-span-6 font-sans text-slate-400 text-sm leading-relaxed font-normal">
              {item.detail}
            </div>

            {/* Tag / Badge */}
            <div className="md:col-span-2 md:text-right">
              <span className="inline-block px-3 py-1 text-[11px] uppercase tracking-wider font-mono text-slate-300 bg-white/[0.04] border border-white/20">
                {item.tag}
              </span>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
