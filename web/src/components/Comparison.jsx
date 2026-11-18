import React from 'react';

const SPECS = [
  { label: "Formats audio supportés", value: "MP3, M4A, AAC, WAV, FLAC, WMA, OGG/Opus, AIFF, AMR" },
  { label: "Formats visuels de fond", value: "JPG, PNG, GIF animé, WebP, APNG, BMP, TIFF, MP4, MOV, WebM" },
  { label: "Sortie vidéo", value: "MP4 (H.264 High Profile, 30 i/s, AAC stéréo 192 kb/s)" },
  { label: "Résolutions proposées", value: "16:9 (1920×1080), 9:16 (1080×1920), 1:1 (1080×1080)" },
  { label: "Moteur d'encodage", value: "Microsoft Windows Media Foundation (accélération matérielle GPU)" },
  { label: "Système requis", value: "Windows 10 ou Windows 11 (64-bit)" },
  { label: "Taille du binaire", value: "~11 Mo (un seul fichier exécutable, aucune installation requise)" }
];

export default function Comparison() {
  return (
    <section id="specs" className="max-w-4xl mx-auto px-6 py-12">
      
      <div className="mb-6 text-left">
        <h2 className="text-xl font-medium text-slate-100 tracking-tight mb-2">
          Spécifications techniques
        </h2>
        <p className="text-sm text-slate-400">
          Détails des formats pris en charge et des caractéristiques d'encodage.
        </p>
      </div>

      <div className="bg-[#12151D] border border-white/[0.07] rounded-xl overflow-hidden">
        <dl className="divide-y divide-white/[0.06]">
          {SPECS.map((s, idx) => (
            <div key={idx} className="px-5 py-3.5 sm:grid sm:grid-cols-3 sm:gap-4 text-xs">
              <dt className="text-slate-400 font-medium">{s.label}</dt>
              <dd className="mt-1 sm:mt-0 sm:col-span-2 text-slate-200 font-mono">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

    </section>
  );
}
