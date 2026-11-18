import React from 'react';
import { Shield, Sparkles, Smartphone, Layers, Cpu, Eye } from 'lucide-react';

const FEATURES = [
  {
    icon: Shield,
    title: 'Traitement 100 % local',
    desc: 'Tout est calculé sur votre machine. Vos morceaux et visuels ne sont jamais envoyés sur internet, garantissant une confidentialité totale.'
  },
  {
    icon: Smartphone,
    title: 'Formats 16:9, 9:16 et 1:1',
    desc: 'Générez des vidéos au format paysage pour YouTube, des vidéos verticales pour TikTok et Instagram Reels, ou des formats carrés pour les publications.'
  },
  {
    icon: Layers,
    title: 'Cadrage et fond flou',
    desc: 'Trois modes de cadrage : remplir, contenir sur fond noir, ou fond flou dynamique automatique pour sublimer les images qui ne sont pas au ratio.'
  },
  {
    icon: Cpu,
    title: 'Accélération Windows native',
    desc: 'Écrit en Rust et interfacé directement avec Windows Media Foundation pour l’encodage matériel H.264 et AAC. Zéro dépendance FFmpeg.'
  },
  {
    icon: Eye,
    title: 'Pré-écoute audio intégrée',
    desc: 'Lecteur audio avec scrubbing fluide et raccourci espace pour écouter et vérifier votre morceau avant de lancer la génération vidéo.'
  },
  {
    icon: Sparkles,
    title: 'Fonds animés et boucles',
    desc: 'Prend en charge les images fixes (JPG, PNG, WebP), les GIF et WebP animés, ainsi que les boucles vidéo (MP4, MOV, WebM).'
  }
];

export default function Features() {
  return (
    <section id="features" className="max-w-4xl mx-auto px-6 py-16">
      
      <div className="mb-10 text-left">
        <h2 className="text-xl font-medium text-slate-100 tracking-tight mb-2">
          Conçu pour être rapide, sobre et autonome.
        </h2>
        <p className="text-sm text-slate-400">
          Les fonctionnalités essentielles d'un studio de conversion, sans surcharge.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-xl bg-[#12151D] border border-white/[0.07] text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-3.5 text-slate-300">
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="font-medium text-sm text-slate-100 mb-1.5">
                {feat.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          );
        })}
      </div>

    </section>
  );
}
