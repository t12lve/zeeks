import React from 'react';
import Logo from './Logo';
import { Download, Disc, Terminal, ShieldCheck } from 'lucide-react';
import { GithubIcon } from './Icons';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0B0F19]/90 border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="#top" className="flex items-center gap-2 group">
          <Logo className="h-8 w-auto transition-transform group-hover:scale-105" />
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-semibold text-slate-300">
          <a href="#vumeter" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            VU-MÈTRE STUDIO
          </a>
          <a href="#features" className="hover:text-slate-100 transition-colors">
            ATOUTS
          </a>
          <a href="#comparison" className="hover:text-slate-100 transition-colors">
            COMPARATIF
          </a>
          <a href="#cli" className="hover:text-slate-100 transition-colors flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            CLI BATCH
          </a>
          <a href="#download" className="hover:text-slate-100 transition-colors">
            TÉLÉCHARGER
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/t12lve/zeeks"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg bg-[#141C2E] hover:bg-[#1E293B] text-slate-300 border border-slate-800 transition-colors"
            title="Code source sur GitHub"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

          <a
            href="https://github.com/t12lve/zeeks/releases/download/v0.2.0/zeeks.exe"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-display font-black text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(234,88,12,0.4)] flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>ZEEKS.EXE (11 Mo)</span>
          </a>
        </div>

      </div>
    </header>
  );
}
