import React from 'react';
import Logo from './Logo';
import { Download } from 'lucide-react';
import { GithubIcon } from './Icons';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0B0D13]/90 border-b border-white/[0.06] px-6 py-3.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="#top" className="flex items-center gap-2 transition-opacity hover:opacity-90">
          <Logo className="h-7 w-auto" />
        </a>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/t12lve/zeeks"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/5 transition-colors"
            title="Dépôt GitHub"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

          <a
            href="https://github.com/t12lve/zeeks/releases/download/v0.2.0/zeeks.exe"
            className="px-3.5 py-1.5 rounded-lg bg-white text-slate-950 hover:bg-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger (11 Mo)</span>
          </a>
        </div>

      </div>
    </header>
  );
}
