import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

const CLI_SNIPPETS = [
  {
    id: 'simple',
    title: '01 / STANDARD 16:9',
    desc: 'Conversion d’un fichier audio et d’une pochette au format standard 1080p pour YouTube.',
    cmd: 'zeeks.exe --convert --audio "morceau.mp3" --visual "cover.jpg" --out "clip.mp4"'
  },
  {
    id: 'tiktok',
    title: '02 / TIKTOK & REELS 9:16',
    desc: 'Génération verticale avec fond flou dynamique automatique pour sublimer les images horizontales.',
    cmd: 'zeeks.exe --convert --audio "beat.wav" --visual "cover.png" --out "tiktok.mp4" --format 9:16 --fit blur'
  },
  {
    id: 'batch',
    title: '03 / BATCH POWERSHELL',
    desc: 'Boucle automatique traitant tous les fichiers audio du dossier en une seule exécution.',
    cmd: `Get-ChildItem *.mp3 | ForEach-Object {
    $out = "$($_.BaseName).mp4"
    zeeks.exe --convert --audio $_.FullName --visual "cover.jpg" --out $out --fit blur
}`
  }
];

export default function CliShowcase() {
  const [activeSnippet, setActiveSnippet] = useState(0);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(CLI_SNIPPETS[activeSnippet].cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="cli" className="max-w-6xl mx-auto px-4 sm:px-8 py-20 border-t border-white/10">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-500 mb-2 font-bold">
            <span>// 04: AUTOMATISATION & CLI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
            Intégration script et batch
          </h2>
        </div>
        <div className="text-xs font-mono text-slate-400 border border-white/15 px-3.5 py-2 bg-[#0E1017]">
          COMPATIBLE CMD · POWERSHELL · BASH
        </div>
      </div>

      {/* Terminal Block */}
      <div className="border border-white/20 bg-[#08090D] shadow-xl">
        
        {/* Top Control Bar & Tabs */}
        <div className="bg-[#0E1017] border-b border-white/10 flex flex-wrap items-center justify-between">
          <div className="flex flex-wrap text-xs font-mono">
            {CLI_SNIPPETS.map((snip, idx) => (
              <button
                key={snip.id}
                onClick={() => setActiveSnippet(idx)}
                className={`px-6 py-4 uppercase tracking-wider transition-colors border-r border-white/20 ${
                  activeSnippet === idx
                    ? 'bg-[#181D28] text-white font-bold border-b-2 border-b-blue-500'
                    : 'text-slate-400 hover:text-white bg-transparent hover:bg-white/[0.04]'
                }`}
              >
                {snip.title}
              </button>
            ))}
          </div>

          <div className="p-2.5 pr-4">
            <button
              onClick={copyCode}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-slate-200 text-xs font-mono font-bold uppercase tracking-wider transition-colors border border-white"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">COPIÉ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-black" />
                  <span>COPIER LA COMMANDE</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Description Banner */}
        <div className="px-6 py-3 bg-black/40 border-b border-white/10 text-xs font-mono text-slate-400">
          <span className="text-slate-600 mr-2 font-semibold">DESC:</span>
          <span>{CLI_SNIPPETS[activeSnippet].desc}</span>
        </div>

        {/* Code Content */}
        <div className="p-8 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto whitespace-pre leading-relaxed bg-black/90">
          <div className="flex items-center gap-2 text-slate-600 mb-4 select-none text-[11px]">
            <Terminal className="w-4 h-4 text-slate-500" />
            <span className="uppercase tracking-wider">POWERSHELL TERMINAL // WIN64</span>
          </div>
          <code className="text-amber-400 block select-all font-mono">
            {CLI_SNIPPETS[activeSnippet].cmd}
          </code>
        </div>

      </div>

    </section>
  );
}
