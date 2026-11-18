import React from 'react';
import Logo from './Logo';
import { GithubIcon } from './Icons';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#090B10] py-10 px-6 text-xs text-slate-500">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Brand & Note */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <Logo className="h-6 w-auto" />
          <span className="text-slate-500 text-xs hidden sm:inline">·</span>
          <span className="text-slate-500 text-xs">
            Audio vers Vidéo en local pour Windows
          </span>
        </div>

        {/* Links & Source */}
        <div className="flex items-center gap-5 text-xs text-slate-400">
          <a href="#top" className="hover:text-slate-200 transition-colors">
            Haut de page
          </a>
          <a
            href="https://github.com/t12lve/zeeks"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>

      </div>
    </footer>
  );
}
