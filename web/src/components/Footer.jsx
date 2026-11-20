import React from 'react';
import Logo from './Logo';
import { GithubIcon } from './Icons';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050608] py-16 px-4 sm:px-8 text-xs font-mono text-slate-500">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Brand & Meta */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <Logo className="h-6 w-auto" />
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-slate-400">
            ZEEKS v0.2.0 · NATIVE WIN64 AUDIO/VIDEO WORKSTATION · OPEN SOURCE
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-slate-400">
          <a href="#top" className="hover:text-white transition-colors uppercase tracking-wider">
            [ HAUT DE PAGE ↑ ]
          </a>
          <a
            href="https://github.com/t12lve/zeeks"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors flex items-center gap-2 uppercase tracking-wider"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GITHUB</span>
          </a>
        </div>

      </div>
    </footer>
  );
}
