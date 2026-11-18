import React from 'react';
import Logo from './Logo';
import { Heart, Shield, Radio, FileCode2 } from 'lucide-react';
import { GithubIcon } from './Icons';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#080B13] py-12 px-4 text-xs font-mono text-slate-400">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Tagline */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <Logo className="h-7 w-auto" />
          <p className="text-slate-500 text-[11px] max-w-sm text-center md:text-left mt-1">
            Transformateur Audio vers Vidéo Natif Windows PC.
            0 upload, 0 cloud, 100% en local avec Media Foundation.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 font-semibold">
          <a href="#vumeter" className="hover:text-amber-400 transition-colors">
            VU-Mètre Studio
          </a>
          <a href="#features" className="hover:text-slate-200 transition-colors">
            Performances
          </a>
          <a href="#cli" className="hover:text-slate-200 transition-colors">
            Mode CLI
          </a>
          <a href="#download" className="hover:text-slate-200 transition-colors">
            Téléchargement
          </a>
          <a
            href="https://github.com/t12lve/zeeks"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            GitHub
          </a>
        </div>

        {/* Copyright & Rust Badge */}
        <div className="text-center md:text-right text-[11px] text-slate-500 space-y-1">
          <div>ZEEKS © 2026 • Projet Open Source</div>
          <div className="text-slate-400 font-medium">
            Développé en <span className="text-amber-400 font-bold">Rust</span> & <span className="text-blue-400 font-bold">React 19</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
