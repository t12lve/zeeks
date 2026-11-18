import React from 'react';
import { Check, X, Shield, Zap, Sparkles } from 'lucide-react';

const COMPARISON_ROWS = [
  {
    feature: "Confidentialité & Données",
    zeeks: "100% sur votre PC (0 octet envoyé)",
    zeeksOk: true,
    cloud: "Fichiers uploadés sur des serveurs tiers",
    cloudOk: false,
    ffmpeg: "Local mais complexe"
  },
  {
    feature: "Vitesse d'exportation",
    zeeks: "~2 secondes (accéléré par Windows)",
    zeeksOk: true,
    cloud: "Upload lent + File d'attente + Téléchargement",
    cloudOk: false,
    ffmpeg: "Rapide"
  },
  {
    feature: "Formats Verticaux (9:16 TikTok/Shorts)",
    zeeks: "Sélection native 16:9, 9:16 et 1:1",
    zeeksOk: true,
    cloud: "Rarement supporté (16:9 forcé)",
    cloudOk: false,
    ffmpeg: "Nécessite des filtres complexes"
  },
  {
    feature: "Cadrage Fond Flou esthétique",
    zeeks: "Automatique et instantané",
    zeeksOk: true,
    cloud: "Bandes noires basiques ou option payante",
    cloudOk: false,
    ffmpeg: "Nécessite -filter_complex lourd"
  },
  {
    feature: "Limite de taille de fichier",
    zeeks: "Illimitée (selon votre disque dur)",
    zeeksOk: true,
    cloud: "Bridé à 50 Mo / 100 Mo (abonnements)",
    cloudOk: false,
    ffmpeg: "Illimitée"
  },
  {
    feature: "Installation & Taille",
    zeeks: "1 seul .exe portable (11 Mo)",
    zeeksOk: true,
    cloud: "Navigateur requis avec publicité",
    cloudOk: false,
    ffmpeg: "Archive de 100+ Mo à configurer dans le PATH"
  },
  {
    feature: "Pré-écoute audio intégrée",
    zeeks: "Oui, avec scrubbing et espace",
    zeeksOk: true,
    cloud: "Non, conversion à l'aveugle",
    cloudOk: false,
    ffmpeg: "Aucune interface graphique"
  }
];

export default function Comparison() {
  return (
    <section id="comparison" className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-mono font-bold text-blue-400 tracking-wider uppercase bg-blue-950/40 px-3 py-1 rounded-full border border-blue-800/60 inline-block mb-3">
          POURQUOI CHOISIR ZEEKS
        </span>
        <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
          La fin des Convertisseurs Cloud Lents & Intrusifs
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-3">
          Gardez la maîtrise absolue de vos masters audio et gagnez un temps précieux.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0E1524] shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-[#131A2B] text-xs font-mono uppercase tracking-wider">
              <th className="p-4 sm:p-5 text-slate-300">Critère</th>
              <th className="p-4 sm:p-5 text-amber-400 font-extrabold bg-amber-500/10 border-x border-amber-500/20">
                ZEEKS (Natif Windows)
              </th>
              <th className="p-4 sm:p-5 text-slate-400">Convertisseurs en ligne</th>
              <th className="p-4 sm:p-5 text-slate-500 hidden sm:table-cell">FFmpeg CLI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 text-xs sm:text-sm font-sans">
            {COMPARISON_ROWS.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                <td className="p-4 sm:p-5 font-semibold text-slate-200">
                  {row.feature}
                </td>

                {/* ZEEKS Column Highlight */}
                <td className="p-4 sm:p-5 font-bold text-slate-100 bg-amber-500/5 border-x border-amber-500/20">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[3]" />
                    <span>{row.zeeks}</span>
                  </div>
                </td>

                {/* Cloud Converters */}
                <td className="p-4 sm:p-5 text-slate-400">
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-400 shrink-0 stroke-[2.5]" />
                    <span>{row.cloud}</span>
                  </div>
                </td>

                {/* FFmpeg */}
                <td className="p-4 sm:p-5 text-slate-500 hidden sm:table-cell">
                  {row.ffmpeg}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
