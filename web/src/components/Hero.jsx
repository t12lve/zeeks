import React from 'react';
import { Download, Play, Shield, Laptop, Zap } from 'lucide-react';
import { GithubIcon } from './Icons';

export default function Hero() {
  return (
    <section className="pt-16 pb-12 px-6 text-center">
      <div className="max-w-3xl mx-auto">
        
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-300 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>ZEEKS v0.2.0 pour Windows</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-slate-100 mb-5 leading-[1.15]">
          Vos fichiers audio en vidéo MP4.<br />
          100 % en local sur votre PC.
        </h1>

        {/* Subtitle */}
        <p className="text-base text-slate-400 max-w-xl mx-auto mb-9 font-normal leading-relaxed">
          Un MP3, une image de pochette, et une vidéo 1080p prête pour YouTube, TikTok ou Instagram.
          Zéro upload vers un serveur, aucun compte, accéléré par Windows Media Foundation.
        </p>

        {/* Primary CTA & Secondary Action */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-12">
          <a
            href="https://github.com/t12lve/zeeks/releases/download/v0.2.0/zeeks.exe"
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger zeeks.exe</span>
            <span className="text-xs text-blue-200 font-mono">11 Mo</span>
          </a>

          <a
            href="https://github.com/t12lve/zeeks"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 border border-white/10 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <GithubIcon className="w-4 h-4" />
            <span>Code source</span>
          </a>
        </div>

        {/* Key Attributes row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/[0.06] text-xs text-slate-400">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>100 % hors-ligne</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-3.5 h-3.5 text-slate-400" />
            <span>Rendu matériel H.264</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Laptop className="w-3.5 h-3.5 text-slate-400" />
            <span>Exécutable portable</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 flex items-center justify-center font-mono text-[10px] text-slate-400 border border-slate-600 rounded">16</span>
            <span>Formats 16:9, 9:16, 1:1</span>
          </div>
        </div>

      </div>
    </section>
  );
}
