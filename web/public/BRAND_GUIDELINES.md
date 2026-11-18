# ZEEKS — Brand Identity & Logo Guidelines

> **Application** : ZEEKS — Transformateur Audio vers Vidéo Natif Windows PC  
> **Direction Artistique** : Concept B (Métamorphose : Onde Acoustique vers Cadre 16:9)  
> **Harmonie Chromatique** : Orange Ambré (`#EA580C`) & Bleu Roi Électrique (`#2563EB`)

---

## 1. Concept & Récit de Marque

Le logo de **ZEEKS** illustre de manière épurée, architecturale et hautement mémorable la transformation fondamentale de l'application : **convertir un son (signal 1D invisible) en une vidéo (surface 2D 16:9 structurée)**.

- **L'Onde Sonore (Gauche — Orange Ambré `#EA580C`)** :
  Trois barres harmoniques verticales incarnent l'énergie brute, vivante et analogique du son.
  L'enveloppe sonore présente une dynamique acoustique naturelle (attaque à 40px, crête résonante à 116px, décroissance harmonique à 72px) qui évite tout cliché d'indicateur de réseau cellulaire.
- **Le Cadre Vidéo 16:9 (Droite — Bleu Roi `#2563EB`)** :
  L'onde se cristallise directement dans les limites du format vidéo. Le sommet et la base de la 3ᵉ barre acoustique s'alignent au pixel près sur la fenêtre d'ouverture (aperture) du moniteur. Le bleu roi incarne la stabilité, la clarté numérique et la précision technologique.
- **La Typographie "ZEEKS"** :
  Dessinée sur mesure en géométrie vectorielle pure sans empattement. La lettre **Z** fait écho aux biseaux de fréquence, tandis que le double **E**, le **K** et le **S** assurent une assise moderne et technologique.

---

## 2. Palette de Couleurs Officielles

### Couleurs Principales

| Rôle | Nom | HEX | RGB | CMYK | HSL |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Structure & Vidéo** | **Bleu Roi Électrique** | `#2563EB` | `37, 99, 235` | `84, 58, 0, 8` | `221°, 83%, 53%` |
| **Énergie & Son** | **Orange Ambré Chaud** | `#EA580C` | `234, 88, 12` | `0, 62, 95, 8` | `21°, 90%, 48%` |

### Couleurs Neutres & d'Interface

| Rôle | Nom | HEX | Usage |
| :--- | :--- | :--- | :--- |
| **Dark Canvas** | Bleu Nuit Profond | `#0B0F19` | Fond d'application sombre, bannières dark |
| **Windows Dark** | Anthracite Windows | `#202020` | Barre de titre et fenêtres Windows 11 Dark |
| **Surface Dark** | Ardoise Sombre | `#1E293B` | Cartes, panneaux et conteneurs d'interface |
| **Light Canvas** | Blanc Pur | `#FFFFFF` | Fond clair standard, documents print |
| **Off-White** | Blanc Givré | `#F8FAFC` | Fonds d'interface clairs, cards soft |

---

## 3. Contrastes & Conformité Accessibilité (WCAG 2.1 AA)

Toutes les couleurs ont été testées et validées par audit colorimétrique :

- **Sur Fond Blanc (`#FFFFFF`)** :
  - Bleu Roi `#2563EB` : **5.17:1** (Conforme WCAG AA pour texte et UI)
  - Orange Ambré `#EA580C` : **3.56:1** (Conforme composant graphique UI ≥ 3.0:1)
- **Sur Fond Sombre (`#0B0F19`)** :
  - Orange Ambré `#EA580C` : **5.38:1** (Conforme WCAG AA texte & UI)
  - Bleu Roi `#2563EB` : **3.71:1** (Conforme composant graphique UI ≥ 3.0:1)
- **Sur Fond Windows 11 Dark (`#202020`)** :
  - Orange Ambré `#EA580C` : **4.58:1** (WCAG AA)
  - Bleu Roi `#2563EB` : **3.15:1** (Composant UI)

---

## 4. Fichiers Masters & Déclinaisons

### Fichiers Masters SVG (`assets/logo/kit/`)
1. `zeeks_symbol.svg` : Symbole officiel isolé (viewBox="0 0 256 256").
2. `zeeks_lockup_horizontal.svg` : Lockup horizontal officiel (Symbole + Wordmark ZEEKS).
3. `zeeks_lockup_stacked.svg` : Lockup vertical / centré (Symbole au-dessus du mot-symbole).

### Variantes Monochromes & Systèmes
- `*-black.svg` & `*-black.png` : Version 100% noir pour documents monochromes et tampons.
- `*-white.svg` & `*-white.png` : Version 100% blanc inversé pour fonds sombres et photos.
- `*-mono-#2563eb.svg` : Version unicolore Bleu Roi.
- `*-mono-#ea580c.svg` : Version unicolore Orange Ambré.
- `*-app-icon.svg` : Tuile d'application native Windows / macOS / Mobile.

### Icônes Web & Application
- `favicon.ico` : Multi-résolutions (16, 32, 48 px) pour Windows et navigateurs.
- `icon-192.png` & `icon-512.png` : Icônes haute résolution pour PWA et raccourcis bureau.
- `apple-touch-icon.png` : 180x180 px.
- `assets/icon.png` : 256x256 px intégré directement dans le binaire Rust (`src/main.rs`).

---

## 5. Règles d'Usage & Zone de Protection

### Zone de Protection (Clear Space)
- Conserver un espace libre minimum équivalent à la largeur d'une barre acoustique (**$X = 16\text{ px}$**) tout autour du symbole.
- Aucun texte, image ou élément graphique ne doit pénétrer cette zone.

### Tailles Minimales de Reproduction
- **Numérique (Favicon / Taskbar / System Tray)** : **$16 \times 16\text{ px}$** (géométrie testée et vérifiée sans bavure).
- **Print / Sérigraphie** : **$12\text{ mm}$** de largeur minimale.

### Interdictions Formelles
- ❌ Ne jamais modifier les proportions (pas d'écrasement ni d'étirement anamorphique).
- ❌ Ne pas changer les teintes sans respecter les spécifications officielles.
- ❌ Ne pas rajouter d'ombres portées agressives, lueurs néon ou filtres raster.
- ❌ Ne pas séparer les barres sonores de leur cadre récepteur.
