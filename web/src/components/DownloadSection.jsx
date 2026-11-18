import React from 'react';
import { Download } from 'lucide-react';
import { GithubIcon, WindowsIcon } from './Icons';

export default function DownloadSection() {
  return (
    <section id="download" className="max-w-4xl mx-auto px-6 py-16">
      <div className="rounded-2xl p-8 sm:p-10 border border-white/10 bg-[#12151D] text-center">
        
        <h2 className="text-2xl font-medium text-slate-100 tracking-tight mb-3">
          Prêt à créer vos vidéos ?
        </h2>

        <p className="text-sm text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
          Un exécutable unique, autonome et portable.
          Aucune installation compliquée : téléchargez et lancez.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <a
            href="https://github.com/t12lve/zeeks/releases/download/v0.2.0/zeeks.exe"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger zeeks.exe</span>
            <span className="text-xs text-blue-200 font-mono">11 Mo</span>
          </a>

          <a
            href="https://github.com/t12lve/zeeks/releases"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-5 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            <GithubIcon className="w-4 h-4" />
            <span>Historique des versions</span>
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-500">
          <span className="flex items-center gap-1.5">
            <WindowsIcon className="w-3.5 h-3.5" />
            Windows 10 / 11 (64-bit)
          </span>
          <span>·</span>
          <span>Version 0.2.0</span>
          <span>·</span>
          <span>Code source libre sur GitHub</span>
        </div>

      </div>
    </section>
  );
}
