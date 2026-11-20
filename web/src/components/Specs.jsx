import React from 'react';

const SPECS = [
  { label: 'Exécutable', value: 'Portable Windows (11 Mo), zéro dépendance' },
  { label: 'Moteur', value: 'Rust & Windows Media Foundation natif' },
  { label: 'Sortie vidéo', value: 'MP4 H.264 / AAC jusqu’à 1080p 60fps' },
  { label: 'Cadrages', value: '16:9 (YouTube), 9:16 (Reels/TikTok), 1:1 (Carré)' },
  { label: 'Formats source', value: 'Audio : MP3, WAV, FLAC, M4A · Image : JPG, PNG, GIF, MP4' },
  { label: 'Confidentialité', value: '100 % local, aucun upload réseau' },
];

export default function Specs() {
  return (
    <section className="max-w-4xl mx-auto px-6 mb-16">
      <div className="border border-white/10 rounded-xl bg-white/[0.02] p-6 sm:p-8">
        <h2 className="text-xs uppercase tracking-wider text-slate-400 font-mono mb-6">
          Caractéristiques techniques
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
          {SPECS.map((spec) => (
            <div key={spec.label} className="space-y-1.5">
              <dt className="text-slate-500 font-mono text-[11px]">{spec.label}</dt>
              <dd className="text-slate-200 font-normal leading-relaxed">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
