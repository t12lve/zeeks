import React from 'react';
import { 
  AudioWaveform, 
  Film, 
  Smartphone, 
  Gauge, 
  Eye, 
  Cpu, 
  Repeat, 
  SlidersHorizontal 
} from 'lucide-react';

const FEATURES = [
  {
    icon: AudioWaveform,
    color: 'text-amber-400',
    border: 'border-amber-500/20',
    title: 'Compatibilité Audio Totale',
    desc: 'Accepte MP3, M4A, AAC, WAV, FLAC, WMA, OGG, Opus, AIFF et AMR. Décodé directement via le pipeline PCM 48 kHz de Windows.'
  },
  {
    icon: Smartphone,
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    title: 'Formats Verticaux & Réseaux',
    desc: 'Produit du 16:9 (YouTube / Écrans), mais aussi du 9:16 natif (TikTok, Instagram Reels, YouTube Shorts) et du format 1:1 carré.'
  },
  {
    icon: Film,
    color: 'text-orange-400',
    border: 'border-orange-500/20',
    title: 'Fonds Flous & Clips Animés',
    desc: 'Mode Fond Flou professionnel automatique. Supporte les images fixes, GIF animés, WebP animés et même les boucles vidéo MP4 / MOV de fond.'
  },
  {
    icon: Gauge,
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    title: 'Vitesse Foudroyante (~2 sec)',
    desc: '30 secondes de musique converties en 1080p en environ 2 secondes. Aucune file d\'attente, aucun upload, 100% de la puissance de votre PC.'
  },
  {
    icon: Eye,
    color: 'text-indigo-400',
    border: 'border-indigo-500/20',
    title: 'Pré-écoute Intégrée',
    desc: 'Lecteur audio natif intégré sous la zone de glisser-déposer avec barre de progression interactive, curseur temporel et raccourci espace.'
  },
  {
    icon: Cpu,
    color: 'text-amber-500',
    border: 'border-amber-500/20',
    title: 'Zéro FFmpeg • Media Foundation',
    desc: 'Aucun runtime externe ou binaire tiers lourd à installer. Tout passe par l\'API Windows Media Foundation officielle (H.264 High + AAC 192k).'
  }
];

export default function Features() {
  return (
    <section id="features" className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase bg-amber-950/40 px-3 py-1 rounded-full border border-amber-800/60 inline-block mb-3">
          PERFORMANCES & ARCHITECTURE
        </span>
        <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
          Conçu pour les Musiciens, Créateurs & Monteurs
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-3">
          Tout ce dont vous avez besoin pour publier vos compositions et productions sur YouTube, TikTok et les réseaux, sans friction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-gradient-to-b from-[#131A2B] to-[#0D1322] border ${feat.border} hover:border-slate-600 transition-all shadow-xl group`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#1A2338] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon className={`w-5 h-5 ${feat.color}`} />
              </div>
              <h3 className="font-display font-extrabold text-lg text-slate-100 mb-2">
                {feat.title}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                {feat.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
