import React from 'react';
import { Download } from 'lucide-react';
import { GithubIcon } from './Icons';

export default function Hero() {
  return (
    <section className="pt-24 pb-14 px-6 text-center max-w-3xl mx-auto">
      
      {/* Version badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-300 mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span>ZEEKS v0.2.0 · Windows portable (11 Mo)</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-6xl font-medium tracking-tight text-slate-100 mb-6 leading-[1.12]">
        Transformez vos pistes audio en vidéos MP4.
      </h1>

      {/* Subhead */}
      <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
        Un MP3, une image de pochette, et une vidéo 1080p prête pour vos réseaux.
        100 % en local sur votre PC, sans upload ni dépendance externe.
      </p>

      {/* Primary Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href="https://github.com/t12lve/zeeks/releases/download/v0.2.0/zeeks.exe"
          className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all duration-150 flex items-center gap-2 shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Télécharger zeeks.exe</span>
        </a>

        <a
          href="https://github.com/t12lve/zeeks"
          target="_blank"
          rel="noreferrer"
          className="px-5 py-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 font-medium text-sm transition-all duration-150 flex items-center gap-2"
        >
          <GithubIcon className="w-4 h-4" />
          <span>GitHub</span>
        </a>
      </div>

    </section>
  );
}
