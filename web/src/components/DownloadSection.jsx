import React from 'react';
import { Download, ShieldCheck, CheckCircle2, Laptop, FileCheck, ArrowRight } from 'lucide-react';
import { GithubIcon, WindowsIcon } from './Icons';

export default function DownloadSection() {
  return (
    <section id="download" className="py-20 px-4 max-w-5xl mx-auto">
      <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 border border-slate-700/80 bg-gradient-to-b from-[#151E33] via-[#0E1524] to-[#0A0E18] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]">
        
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-b from-amber-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              VERSION OFFICIELLE v0.2.0 DISPONIBLE
            </div>

            <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight leading-tight">
              Téléchargez ZEEKS pour Windows
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Un exécutable unique, autonome et portable d'environ 11 Mo.
              Aucune installation compliquée, aucune invite d'adware ou d'inscription : téléchargez et commencez à convertir vos morceaux immédiatement.
            </p>

            <div className="space-y-2 pt-2">
              {[
                "Compatible Windows 10 (1809+) et Windows 11 (64 bits)",
                "Accélération matérielle GPU via Media Foundation",
                "100% Hors-ligne : vos compositions restent sur votre machine",
                "Code source ouvert, reproductible et auditable"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full bg-[#0B0F19] p-6 rounded-2xl border border-slate-700/80 shadow-2xl text-center space-y-5">
              
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 mx-auto shadow-[0_0_20px_rgba(234,88,12,0.4)]">
                <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
                  <Download className="w-8 h-8 text-amber-400" />
                </div>
              </div>

              <div>
                <div className="font-display font-black text-xl text-white">zeeks.exe</div>
                <div className="font-mono text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5">
                  <WindowsIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Windows x64 • ~11 Mo • v0.2.0</span>
                </div>
              </div>

              <a
                href="https://github.com/t12lve/zeeks/releases/download/v0.2.0/zeeks.exe"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-slate-950 font-display font-black text-sm tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(234,88,12,0.45)] flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>TÉLÉCHARGEMENT DIRECT</span>
              </a>

              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-center gap-3">
                <a
                  href="https://github.com/t12lve/zeeks/releases"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  Toutes les releases
                </a>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">100% Gratuit & Libre</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
