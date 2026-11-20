import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

const CLI_SNIPPETS = [
  {
    id: 'simple',
    title: 'Conversion standard',
    cmd: 'zeeks.exe --convert --audio "morceau.mp3" --visual "cover.jpg" --out "clip.mp4"'
  },
  {
    id: 'tiktok',
    title: 'Format 9:16 vertical (TikTok / Reels)',
    cmd: 'zeeks.exe --convert --audio "beat.wav" --visual "cover.png" --out "tiktok.mp4" --format 9:16 --fit blur'
  },
  {
    id: 'batch',
    title: 'Automatisation en lot (PowerShell)',
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
    <section id="cli" className="max-w-4xl mx-auto px-6 mb-20">
      
      <div className="mb-6 text-left">
        <h2 className="text-xl font-medium text-slate-100 tracking-tight mb-2">
          Automatisation et ligne de commande
        </h2>
        <p className="text-sm text-slate-400">
          Intégrez ZEEKS dans vos scripts PowerShell ou CMD pour traiter des dossiers entiers.
        </p>
      </div>

      <div className="rounded-xl overflow-hidden border border-white/10 bg-[#10131A]">
        
        {/* Terminal Header Bar */}
        <div className="bg-[#141822] px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>PowerShell / Invite de commandes</span>
          </div>

          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono transition-colors border border-white/10"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300">Copié</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>

        {/* Snippet Tabs */}
        <div className="flex border-b border-white/[0.06] bg-[#0E1017] px-3 gap-1 overflow-x-auto text-xs">
          {CLI_SNIPPETS.map((snip, idx) => (
            <button
              key={snip.id}
              onClick={() => setActiveSnippet(idx)}
              className={`px-3 py-2 font-medium transition-colors border-b-2 -mb-[1px] ${
                activeSnippet === idx
                  ? 'border-blue-500 text-slate-100 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {snip.title}
            </button>
          ))}
        </div>

        {/* Command Body */}
        <div className="p-5 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre leading-relaxed bg-[#0B0D13]">
          <span className="select-all text-amber-300">{CLI_SNIPPETS[activeSnippet].cmd}</span>
        </div>

      </div>
    </section>
  );
}
