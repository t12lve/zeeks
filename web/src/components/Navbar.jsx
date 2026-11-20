import React from 'react';
import Logo from './Logo';
import { Download, ExternalLink } from 'lucide-react';
import { GithubIcon } from './Icons';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#08090D]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Engine Indicator */}
        <div className="flex items-center gap-4">
          <a href="#top" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Logo className="h-6 w-auto" />
          </a>
          <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-slate-400 border-l border-white/10 pl-4">
            <span className="w-2 h-2 bg-emerald-400 animate-pulse" />
            <span className="tracking-wider uppercase text-slate-300">AUDIO-TO-VIDEO ENGINE</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">WIN-x64 NATIVE</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:inline-block px-2.5 py-1 border border-white/10 text-[11px] font-mono text-slate-400">
            v0.2.0
          </div>

          <a
            href="https://github.com/t12lve/zeeks"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 border border-white/15 bg-white/[0.02] hover:bg-white/10 text-slate-300 text-xs font-mono transition-colors flex items-center gap-2"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GITHUB</span>
          </a>

          <a
            href="https://github.com/t12lve/zeeks/releases/download/v0.2.0/zeeks.exe"
            className="px-4 py-1.5 bg-white text-black hover:bg-slate-200 text-xs font-mono font-bold tracking-wider transition-colors flex items-center gap-2 border border-white"
          >
            <Download className="w-3.5 h-3.5" />
            <span>TÉLÉCHARGER (11 MO)</span>
          </a>
        </div>

      </div>
    </header>
  );
}
