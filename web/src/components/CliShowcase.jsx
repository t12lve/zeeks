import React, { useState } from 'react';
import { Terminal, Copy, Check, Code2, Play } from 'lucide-react';

const CLI_SNIPPETS = [
  {
    id: 'tiktok',
    title: 'Format 9:16 TikTok / Reels (Fond Flou)',
    cmd: `zeeks.exe --convert --audio "beat.mp3" --visual "cover.jpg" --out "tiktok_clip.mp4" --format 9:16 --fit blur --quality high`
  },
  {
    id: 'youtube',
    title: 'Format 16:9 Standard YouTube 1080p',
    cmd: `zeeks.exe --convert --audio "album_track.wav" --visual "artwork.png" --out "youtube_fullhd.mp4" --format 16:9 --fit fill --quality high`
  },
  {
    id: 'batch',
    title: 'Automatisation en Lot (PowerShell)',
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
    <section id="cli" className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase bg-amber-950/40 px-3 py-1 rounded-full border border-amber-800/60 inline-block mb-3">
          AUTOMATISATION & LIGNE DE COMMANDE
        </span>
        <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
          Intégrez ZEEKS dans vos Scripts & Pipelines
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-3">
          Outre son interface graphique egui native, ZEEKS propose un mode ligne de commande autonome idéal pour convertir un album entier en quelques secondes.
        </p>
      </div>

      <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden border border-slate-800 bg-[#090D17] shadow-2xl">
        {/* Terminal Header */}
        <div className="bg-[#101726] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-xs font-mono text-slate-400 ml-2 font-medium flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              Windows Terminal • PowerShell / CMD
            </span>
          </div>

          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#192338] hover:bg-[#23314E] text-slate-300 text-xs font-mono transition-colors border border-slate-700/80"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>

        {/* Snippet Tabs */}
        <div className="flex border-b border-slate-800 bg-[#0D1322] px-3 pt-2 gap-2 overflow-x-auto">
          {CLI_SNIPPETS.map((snip, idx) => (
            <button
              key={snip.id}
              onClick={() => setActiveSnippet(idx)}
              className={`px-3 py-2 rounded-t-lg text-xs font-mono font-semibold transition-colors shrink-0 ${
                activeSnippet === idx
                  ? 'bg-[#090D17] text-amber-300 border-t border-x border-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {snip.title}
            </button>
          ))}
        </div>

        {/* Command Body */}
        <div className="p-6 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto whitespace-pre leading-relaxed">
          <div className="text-slate-500 mb-2"># Code de retour 0 si succès, 1 si échec</div>
          <div className="text-amber-400 select-all">{CLI_SNIPPETS[activeSnippet].cmd}</div>
        </div>

        {/* Terminal Footer Info */}
        <div className="bg-[#0D1422] px-6 py-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
          <span>Sortie : MP4 H.264 High Profile, AAC 192 kb/s, 30 fps</span>
          <span className="text-blue-400 font-semibold">100% sans dépendance externe</span>
        </div>
      </div>
    </section>
  );
}
