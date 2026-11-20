import React from 'react';
import { Download } from 'lucide-react';
import { GithubIcon } from './Icons';

export default function Hero() {
  return (
    <section className="border-b border-white/10 tech-grid">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-20 pb-20">
        
        {/* Technical Coordinate Meta-bar */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-mono text-slate-400 mb-10 pb-4 border-b border-white/10">
          <span className="text-amber-500 font-bold">// 01: ENGINE</span>
          <span className="text-slate-700">|</span>
          <span>TARGET: WIN64</span>
          <span className="text-slate-700">|</span>
          <span>BUILD: RELEASE v0.2.0</span>
          <span className="text-slate-700">|</span>
          <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 bg-emerald-400 inline-block" />
            100% LOCAL / ZERO NETWORK IO
          </span>
        </div>

        {/* Massive Architectural Headline */}
        <div className="max-w-4xl">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 uppercase leading-[1.05]">
            Transformez vos pistes audio en vidéos MP4.
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl leading-relaxed mb-12 font-normal">
            Un fichier audio, une pochette, et une vidéo 1080p prête pour vos publications.
            Génération instantanée en local sur Windows, accélérée matériellement par Media Foundation.
          </p>
        </div>

        {/* Sharp Action Group */}
        <div className="flex flex-wrap items-center gap-4 mb-16">
          <a
            href="https://github.com/t12lve/zeeks/releases/download/v0.2.0/zeeks.exe"
            className="px-7 py-4 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-3 border border-blue-400/40"
          >
            <Download className="w-4 h-4" />
            <span>TÉLÉCHARGER ZEEKS.EXE (11 MO)</span>
          </a>

          <a
            href="https://github.com/t12lve/zeeks"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-4 bg-[#12151D] hover:bg-white/10 text-slate-300 font-mono text-xs uppercase tracking-wider transition-colors flex items-center gap-2.5 border border-white/20"
          >
            <GithubIcon className="w-4 h-4" />
            <span>CODE SOURCE GITHUB</span>
          </a>

          <div className="px-5 py-4 border border-white/10 bg-white/[0.02] text-xs font-mono text-slate-400 flex items-center gap-2">
            <span>SHA-256 VÉRIFIÉ</span>
            <span className="text-slate-700">·</span>
            <span>PORTABLE SANS INSTALLATION</span>
          </div>
        </div>

        {/* Hardware Status Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-white/10 text-xs font-mono">
          <div className="p-5 border-r border-b border-white/10 bg-[#0B0D13]">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Formats vidéo</div>
            <div className="text-slate-200 font-bold text-sm">16:9 · 9:16 · 1:1</div>
          </div>
          <div className="p-5 border-r border-b border-white/10 bg-[#0B0D13]">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Moteur natif</div>
            <div className="text-slate-200 font-bold text-sm">Rust + Windows MF</div>
          </div>
          <div className="p-5 border-r border-b border-white/10 bg-[#0B0D13]">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Encodage</div>
            <div className="text-slate-200 font-bold text-sm">H.264 / AAC 1080p</div>
          </div>
          <div className="p-5 border-r border-b border-white/10 bg-[#0B0D13]">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Exécutable</div>
            <div className="text-slate-200 font-bold text-sm">11 Mo · Standalone</div>
          </div>
        </div>

      </div>
    </section>
  );
}
