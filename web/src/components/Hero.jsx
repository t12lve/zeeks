import React from 'react';
import { Download, Play, ShieldCheck, Zap, Laptop, Music, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-12 pb-8 px-4 text-center overflow-hidden">
      
      {/* Background Studio Ambient Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-amber-600/15 via-blue-600/15 to-transparent blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Top Release Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#131A2B] border border-slate-700/80 shadow-md mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399] animate-pulse" />
          <span className="text-xs font-mono font-bold text-amber-300">ZEEKS v0.2.0 DISPONIBLE</span>
          <span className="text-slate-500">•</span>
          <span className="text-xs font-mono text-slate-300">Édition Studio & VU-Mètre Stéréo</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black tracking-tight text-white mb-6 leading-[1.1]">
          Vos MP3 en Vidéos MP4.<br />
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-blue-500 bg-clip-text text-transparent">
            100% en Local. Zéro Cloud.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          L'équivalent des convertisseurs en ligne, mais sur votre PC : ultra-rapide (30s en ~2s),
          sans upload, sans compte, avec formats 16:9, 9:16 (TikTok/Reels), 1:1 et fonds animés.
          Écrit en <strong className="text-slate-100 font-semibold">Rust natif</strong> avec l'API officielle Windows Media Foundation.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <a
            href="https://github.com/t12lve/zeeks/releases/download/v0.2.0/zeeks.exe"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-slate-950 font-display font-black text-sm tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(234,88,12,0.45)] flex items-center gap-2.5"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>TÉLÉCHARGER ZEEKS.EXE (11 Mo)</span>
          </a>

          <a
            href="#vumeter"
            className="px-6 py-3.5 rounded-xl bg-[#141C2E] hover:bg-[#1B253D] text-slate-200 border border-slate-700 font-display font-bold text-sm tracking-wider uppercase transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>TESTER LE VU-MÈTRE EN DIRECT</span>
          </a>
        </div>

        {/* Key Guarantee Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-4 border-t border-slate-800/80">
          
          <div className="flex items-center gap-2 justify-center text-xs font-mono text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Hors-Ligne & Privé</span>
          </div>

          <div className="flex items-center gap-2 justify-center text-xs font-mono text-slate-300">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Encodage GPU ~2 sec</span>
          </div>

          <div className="flex items-center gap-2 justify-center text-xs font-mono text-slate-300">
            <Laptop className="w-4 h-4 text-blue-400" />
            <span>Un seul .exe (11 Mo)</span>
          </div>

          <div className="flex items-center gap-2 justify-center text-xs font-mono text-slate-300">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Zéro FFmpeg externe</span>
          </div>

        </div>

      </div>
    </section>
  );
}
