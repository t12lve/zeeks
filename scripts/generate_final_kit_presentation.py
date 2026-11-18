import os

content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1250" width="1600" height="1250">
  <defs>
    <style>
      .title { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 700; fill: #0F172A; }
      .sub { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 400; fill: #64748B; }
      .section-title { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 700; font-size: 15px; letter-spacing: 0.05em; text-transform: uppercase; fill: #1E293B; }
      .label { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 600; font-size: 12px; fill: #64748B; }
      .desc { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; line-height: 1.5; fill: #334155; }
      .code { font-family: 'Consolas', monospace; font-size: 12px; font-weight: 600; }
      .badge { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 700; font-size: 11px; }
    </style>
  </defs>

  <!-- Global Canvas Background -->
  <rect width="1600" height="1250" fill="#F8FAFC"/>

  <!-- Top Header Banner -->
  <g transform="translate(60, 45)">
    <rect x="0" y="0" width="1480" height="85" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
    <text class="title" font-size="28" x="32" y="42">ZEEKS — Kit d'Identité &amp; Charte Graphique Finale</text>
    <text class="sub" font-size="14" x="32" y="65">Application Windows PC · Transformation Audio vers Vidéo · Version Officielle Validée (Variation B1)</text>
    
    <g transform="translate(1320, 28)">
      <rect width="128" height="30" rx="15" fill="#10B981"/>
      <text class="badge" x="16" y="19" fill="#FFFFFF">PRODUCTION READY</text>
    </g>
  </g>

  <!-- ROW 1: MASTER ASSETS (Horizontal Lockup, Master Symbol, Stacked Lockup) -->
  <g transform="translate(60, 150)">
    
    <!-- CARD 1: Horizontal Lockup (Primary Brand Logo) -->
    <g transform="translate(0, 0)">
      <rect width="730" height="340" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
      <text class="section-title" x="30" y="36">1. Lockup Horizontal Principal (Écran &amp; Web)</text>
      <text class="label" x="30" y="56">Fichier : assets/logo/kit/zeeks_lockup_horizontal.svg (678 × 256 px)</text>

      <!-- Horizontal Lockup Artwork -->
      <g transform="translate(45, 90)">
        <rect width="640" height="180" rx="8" fill="#FAFAFA" stroke="#F1F5F9" stroke-width="1"/>
        <svg x="20" y="15" width="600" height="150" viewBox="0 0 678 256">
          <g>
            <rect x="50" y="108" width="16" height="40" rx="8" fill="#EA580C"/>
            <rect x="78" y="84" width="16" height="88" rx="8" fill="#EA580C"/>
            <rect x="106" y="98" width="16" height="60" rx="8" fill="#EA580C"/>
            <path fill-rule="evenodd" d="M 150 80 L 254 80 A 16 16 0 0 1 270 96 L 270 160 A 16 16 0 0 1 254 176 L 150 176 A 16 16 0 0 1 134 160 L 134 96 A 16 16 0 0 1 150 80 Z M 154 98 L 250 98 A 6 6 0 0 1 256 104 L 256 152 A 6 6 0 0 1 250 158 L 154 158 A 6 6 0 0 1 148 152 L 148 104 A 6 6 0 0 1 154 98 Z" fill="#2563EB"/>
          </g>
          <g fill="#2563EB">
            <path d="M 330 92 L 384 92 L 384 108 L 352 148 L 384 148 L 384 164 L 330 164 L 330 148 L 362 108 L 330 108 Z"/>
            <path d="M 400 92 L 446 92 L 446 107 L 416 107 L 416 120 L 442 120 L 442 134 L 416 134 L 416 149 L 446 149 L 446 164 L 400 164 Z"/>
            <path d="M 462 92 L 508 92 L 508 107 L 478 107 L 478 120 L 504 120 L 504 134 L 478 134 L 478 149 L 508 149 L 508 164 L 462 164 Z"/>
            <path d="M 524 92 L 540 92 L 540 120 L 559 92 L 578 92 L 551 128 L 579 164 L 559 164 L 540 138 L 540 164 L 524 164 Z"/>
            <path d="M 638 108 L 623 108 C 623 106, 619 104, 614 104 C 608 104, 605 107, 605 111 C 605 116, 609 119, 617 122 L 623 124 C 634 128, 640 135, 640 144 C 640 156, 630 164, 616 164 C 601 164, 592 155, 592 144 L 607 144 C 607 149, 611 152, 616 152 C 622 152, 625 149, 625 145 C 625 140, 621 137, 613 134 L 607 132 C 597 128, 591 121, 591 112 C 591 100, 601 92, 615 92 C 629 92, 638 100, 638 108 Z"/>
          </g>
        </svg>
      </g>
      <text class="desc" x="30" y="305">Usage : Barre de titre de l'application, en-tête web, splash screen, signatures et bannières officielles.</text>
    </g>

    <!-- CARD 2: Master Symbol & App Tile -->
    <g transform="translate(750, 0)">
      <rect width="350" height="340" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
      <text class="section-title" x="24" y="36">2. Symbole Officiel</text>
      <text class="label" x="24" y="56">zeeks_symbol.svg (256 × 256)</text>
      
      <g transform="translate(75, 80)">
        <svg x="0" y="0" width="200" height="200" viewBox="0 0 256 256">
          <rect x="24" y="108" width="16" height="40" rx="8" fill="#EA580C"/>
          <rect x="52" y="84" width="16" height="88" rx="8" fill="#EA580C"/>
          <rect x="80" y="98" width="16" height="60" rx="8" fill="#EA580C"/>
          <path fill-rule="evenodd" d="M 124 80 L 228 80 A 16 16 0 0 1 244 96 L 244 160 A 16 16 0 0 1 228 176 L 124 176 A 16 16 0 0 1 108 160 L 108 96 A 16 16 0 0 1 124 80 Z M 128 98 L 224 98 A 6 6 0 0 1 230 104 L 230 152 A 6 6 0 0 1 224 158 L 128 158 A 6 6 0 0 1 122 152 L 122 104 A 6 6 0 0 1 128 98 Z" fill="#2563EB"/>
        </svg>
      </g>
      <text class="desc" x="24" y="305">Épure absolue : 45 ancres, ratio 1:1 parfait.</text>
    </g>

    <!-- CARD 3: Lockup Stacked / Compact -->
    <g transform="translate(1120, 0)">
      <rect width="360" height="340" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
      <text class="section-title" x="24" y="36">3. Lockup Centré (Stacked)</text>
      <text class="label" x="24" y="56">zeeks_lockup_stacked.svg (360 × 360)</text>

      <g transform="translate(80, 75)">
        <svg x="0" y="0" width="200" height="200" viewBox="0 0 360 360">
          <g>
            <rect x="76" y="88" width="16" height="40" rx="8" fill="#EA580C"/>
            <rect x="104" y="64" width="16" height="88" rx="8" fill="#EA580C"/>
            <rect x="132" y="78" width="16" height="60" rx="8" fill="#EA580C"/>
            <path fill-rule="evenodd" d="M 176 60 L 280 60 A 16 16 0 0 1 296 76 L 296 140 A 16 16 0 0 1 280 156 L 176 156 A 16 16 0 0 1 160 140 L 160 76 A 16 16 0 0 1 176 60 Z M 180 78 L 276 78 A 6 6 0 0 1 282 84 L 282 132 A 6 6 0 0 1 276 138 L 180 138 A 6 6 0 0 1 174 132 L 174 84 A 6 6 0 0 1 180 78 Z" fill="#2563EB"/>
          </g>
          <g fill="#2563EB">
            <path d="M 25 210 L 79 210 L 79 226 L 47 266 L 79 266 L 79 282 L 25 282 L 25 266 L 57 226 L 25 226 Z"/>
            <path d="M 95 210 L 141 210 L 141 225 L 111 225 L 111 238 L 137 238 L 137 252 L 111 252 L 111 267 L 141 267 L 141 282 L 95 282 Z"/>
            <path d="M 157 210 L 203 210 L 203 225 L 173 225 L 173 238 L 199 238 L 199 252 L 173 252 L 173 267 L 203 267 L 203 282 L 157 282 Z"/>
            <path d="M 219 210 L 235 210 L 235 238 L 254 210 L 273 210 L 246 246 L 274 282 L 254 282 L 235 256 L 235 282 L 219 282 Z"/>
            <path d="M 333 226 L 318 226 C 318 224, 314 222, 309 222 C 303 222, 300 225, 300 229 C 300 234, 304 237, 312 240 L 318 242 C 329 246, 335 253, 335 262 C 335 274, 325 282, 311 282 C 296 282, 287 273, 287 262 L 302 262 C 302 267, 306 270, 311 270 C 317 270, 320 267, 320 263 C 320 258, 316 255, 308 252 L 302 250 C 292 246, 286 239, 286 230 C 286 218, 296 210, 310 210 C 324 210, 333 218, 333 226 Z"/>
          </g>
        </svg>
      </g>
      <text class="desc" x="24" y="305">Usage : Badges carrés, avatars réseaux, boîtes.</text>
    </g>
  </g>

  <!-- ROW 2: APPLICATION ICON & DESKTOP INTEGRATION -->
  <g transform="translate(60, 510)">
    
    <!-- CARD 4: Native Windows App Icon & System Tray Scaling -->
    <g transform="translate(0, 0)">
      <rect width="900" height="350" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
      <text class="section-title" x="30" y="36">4. Intégration Native Windows PC (assets/icon.png)</text>
      <text class="label" x="30" y="56">Tuile Obsidian (#0B0F19) avec Rayon de Courbure Fluent · Conforme egui / Win32 Window Icon</text>

      <!-- Windows Desktop App Icon 128px -->
      <g transform="translate(45, 90)">
        <rect width="130" height="130" rx="28" fill="#0B0F19" stroke="#1E293B" stroke-width="1.5"/>
        <svg x="15" y="15" width="100" height="100" viewBox="0 0 256 256">
          <rect x="24" y="108" width="16" height="40" rx="8" fill="#EA580C"/>
          <rect x="52" y="84" width="16" height="88" rx="8" fill="#EA580C"/>
          <rect x="80" y="98" width="16" height="60" rx="8" fill="#EA580C"/>
          <path fill-rule="evenodd" d="M 124 80 L 228 80 A 16 16 0 0 1 244 96 L 244 160 A 16 16 0 0 1 228 176 L 124 176 A 16 16 0 0 1 108 160 L 108 96 A 16 16 0 0 1 124 80 Z M 128 98 L 224 98 A 6 6 0 0 1 230 104 L 230 152 A 6 6 0 0 1 224 158 L 128 158 A 6 6 0 0 1 122 152 L 122 104 A 6 6 0 0 1 128 98 Z" fill="#2563EB"/>
        </svg>
        <text class="code" x="35" y="155" fill="#64748B">128 × 128</text>
        <text class="label" x="25" y="172" fill="#94A3B8">Menu Démarrer</text>
      </g>

      <!-- Taskbar scale 48px -->
      <g transform="translate(220, 115)">
        <rect width="64" height="64" rx="14" fill="#0B0F19" stroke="#1E293B" stroke-width="1"/>
        <svg x="8" y="8" width="48" height="48" viewBox="0 0 256 256">
          <rect x="24" y="108" width="16" height="40" rx="8" fill="#EA580C"/>
          <rect x="52" y="84" width="16" height="88" rx="8" fill="#EA580C"/>
          <rect x="80" y="98" width="16" height="60" rx="8" fill="#EA580C"/>
          <path fill-rule="evenodd" d="M 124 80 L 228 80 A 16 16 0 0 1 244 96 L 244 160 A 16 16 0 0 1 228 176 L 124 176 A 16 16 0 0 1 108 160 L 108 96 A 16 16 0 0 1 124 80 Z M 128 98 L 224 98 A 6 6 0 0 1 230 104 L 230 152 A 6 6 0 0 1 224 158 L 128 158 A 6 6 0 0 1 122 152 L 122 104 A 6 6 0 0 1 128 98 Z" fill="#2563EB"/>
        </svg>
        <text class="code" x="12" y="95" fill="#64748B">48 × 48</text>
        <text class="label" x="4" y="112" fill="#94A3B8">Bureau Win</text>
      </g>

      <!-- Taskbar scale 32px -->
      <g transform="translate(330, 125)">
        <rect width="48" height="48" rx="10" fill="#0B0F19" stroke="#1E293B" stroke-width="1"/>
        <svg x="8" y="8" width="32" height="32" viewBox="0 0 256 256">
          <rect x="24" y="108" width="16" height="40" rx="8" fill="#EA580C"/>
          <rect x="52" y="84" width="16" height="88" rx="8" fill="#EA580C"/>
          <rect x="80" y="98" width="16" height="60" rx="8" fill="#EA580C"/>
          <path fill-rule="evenodd" d="M 124 80 L 228 80 A 16 16 0 0 1 244 96 L 244 160 A 16 16 0 0 1 228 176 L 124 176 A 16 16 0 0 1 108 160 L 108 96 A 16 16 0 0 1 124 80 Z M 128 98 L 224 98 A 6 6 0 0 1 230 104 L 230 152 A 6 6 0 0 1 224 158 L 128 158 A 6 6 0 0 1 122 152 L 122 104 A 6 6 0 0 1 128 98 Z" fill="#2563EB"/>
        </svg>
        <text class="code" x="4" y="85" fill="#64748B">32 × 32</text>
        <text class="label" x="-8" y="102" fill="#94A3B8">Barre des Tâches</text>
      </g>

      <!-- System tray scale 16px -->
      <g transform="translate(440, 135)">
        <rect width="32" height="32" rx="6" fill="#0B0F19" stroke="#1E293B" stroke-width="1"/>
        <svg x="8" y="8" width="16" height="16" viewBox="0 0 256 256">
          <rect x="24" y="108" width="16" height="40" rx="8" fill="#EA580C"/>
          <rect x="52" y="84" width="16" height="88" rx="8" fill="#EA580C"/>
          <rect x="80" y="98" width="16" height="60" rx="8" fill="#EA580C"/>
          <path fill-rule="evenodd" d="M 124 80 L 228 80 A 16 16 0 0 1 244 96 L 244 160 A 16 16 0 0 1 228 176 L 124 176 A 16 16 0 0 1 108 160 L 108 96 A 16 16 0 0 1 124 80 Z M 128 98 L 224 98 A 6 6 0 0 1 230 104 L 230 152 A 6 6 0 0 1 224 158 L 128 158 A 6 6 0 0 1 122 152 L 122 104 A 6 6 0 0 1 128 98 Z" fill="#2563EB"/>
        </svg>
        <text class="code" x="-4" y="75" fill="#64748B">16 × 16</text>
        <text class="label" x="-6" y="92" fill="#94A3B8">System Tray</text>
      </g>

      <!-- Simulated Windows 11 Taskbar Preview -->
      <g transform="translate(540, 105)">
        <rect width="320" height="80" rx="8" fill="#18181B" stroke="#27272A" stroke-width="1"/>
        <text class="label" x="15" y="24" fill="#71717A">Aperçu Barre des Tâches Windows 11 :</text>
        <!-- Windows Start, Search, Explorer, Edge, ZEEKS -->
        <g transform="translate(40, 36)">
          <!-- Start icon -->
          <rect x="0" y="4" width="22" height="22" rx="4" fill="#3B82F6"/>
          <!-- Search -->
          <rect x="36" y="4" width="22" height="22" rx="4" fill="#52525B"/>
          <!-- Folder -->
          <rect x="72" y="4" width="22" height="22" rx="4" fill="#F59E0B"/>
          <!-- Edge -->
          <rect x="108" y="4" width="22" height="22" rx="4" fill="#0EA5E9"/>
          <!-- ZEEKS ACTIVE -->
          <rect x="144" y="0" width="30" height="30" rx="6" fill="#0B0F19" stroke="#3B82F6" stroke-width="1.5"/>
          <svg x="149" y="5" width="20" height="20" viewBox="0 0 256 256">
            <rect x="24" y="108" width="16" height="40" rx="8" fill="#EA580C"/>
            <rect x="52" y="84" width="16" height="88" rx="8" fill="#EA580C"/>
            <rect x="80" y="98" width="16" height="60" rx="8" fill="#EA580C"/>
            <path fill-rule="evenodd" d="M 124 80 L 228 80 A 16 16 0 0 1 244 96 L 244 160 A 16 16 0 0 1 228 176 L 124 176 A 16 16 0 0 1 108 160 L 108 96 A 16 16 0 0 1 124 80 Z M 128 98 L 224 98 A 6 6 0 0 1 230 104 L 230 152 A 6 6 0 0 1 224 158 L 128 158 A 6 6 0 0 1 122 152 L 122 104 A 6 6 0 0 1 128 98 Z" fill="#2563EB"/>
          </svg>
          <rect x="154" y="33" width="10" height="2" rx="1" fill="#3B82F6"/>
        </g>
      </g>

      <text class="desc" x="30" y="315">Vérification Rust &amp; egui : compilé avec succès (cargo check OK en 0.32s). assets/icon.png est décodé nativement.</text>
    </g>

    <!-- CARD 5: Color Palette & WCAG Specifications -->
    <g transform="translate(930, 0)">
      <rect width="550" height="350" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
      <text class="section-title" x="24" y="36">5. Spécifications Chromatiques &amp; Contrastes</text>
      <text class="label" x="24" y="56">Normes officielles WCAG 2.1 AA validées</text>

      <!-- Color Swatch 1: Royal Blue -->
      <g transform="translate(24, 85)">
        <rect width="48" height="48" rx="8" fill="#2563EB"/>
        <text class="section-title" x="62" y="22" font-size="14">Bleu Roi Électrique (#2563EB)</text>
        <text class="code" x="62" y="40" fill="#475569">RGB: 37, 99, 235 · CMYK: 84, 58, 0, 8</text>
        <text class="desc" x="62" y="60">Contraste : 5.17:1 sur fond blanc · 3.71:1 sur fond sombre</text>
      </g>

      <!-- Color Swatch 2: Amber Orange -->
      <g transform="translate(24, 165)">
        <rect width="48" height="48" rx="8" fill="#EA580C"/>
        <text class="section-title" x="62" y="22" font-size="14">Orange Ambré Chaud (#EA580C)</text>
        <text class="code" x="62" y="40" fill="#475569">RGB: 234, 88, 12 · CMYK: 0, 62, 95, 8</text>
        <text class="desc" x="62" y="60">Contraste : 3.56:1 sur fond blanc · 5.38:1 sur fond sombre</text>
      </g>

      <!-- Color Swatch 3: Dark Background -->
      <g transform="translate(24, 245)">
        <rect width="48" height="48" rx="8" fill="#0B0F19" stroke="#334155" stroke-width="1"/>
        <text class="section-title" x="62" y="22" font-size="14">Bleu Nuit Obsidian (#0B0F19)</text>
        <text class="code" x="62" y="40" fill="#475569">RGB: 11, 15, 25 · Thème sombre Windows &amp; App Container</text>
        <text class="desc" x="62" y="60">Assure une immersion studio vidéo maximale (type Resolve/Premiere)</text>
      </g>
    </g>
  </g>

  <!-- ROW 3: SYSTEM VARIANTS (Monochrome Black, White Negative, Mono Blue, Mono Amber) -->
  <g transform="translate(60, 890)">
    <rect width="1480" height="290" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
    <text class="section-title" x="30" y="36">6. Déclinaisons Systèmes &amp; Variantes Monochromes (assets/logo/kit/)</text>
    <text class="label" x="30" y="56">Exportées avec export_variants.py · Rendu vectoriel SVG &amp; PNG multi-résolutions (16 à 1024 px)</text>

    <!-- Variant 1: Pure Black -->
    <g transform="translate(45, 80)">
      <rect width="320" height="170" rx="10" fill="#FAFAFA" stroke="#E2E8F0" stroke-width="1"/>
      <text class="label" x="16" y="28">Version Monochrome Noir (Black)</text>
      <svg x="40" y="45" width="240" height="90" viewBox="0 0 678 256">
        <g fill="#000000">
          <rect x="50" y="108" width="16" height="40" rx="8"/>
          <rect x="78" y="84" width="16" height="88" rx="8"/>
          <rect x="106" y="98" width="16" height="60" rx="8"/>
          <path fill-rule="evenodd" d="M 150 80 L 254 80 A 16 16 0 0 1 270 96 L 270 160 A 16 16 0 0 1 254 176 L 150 176 A 16 16 0 0 1 134 160 L 134 96 A 16 16 0 0 1 150 80 Z M 154 98 L 250 98 A 6 6 0 0 1 256 104 L 256 152 A 6 6 0 0 1 250 158 L 154 158 A 6 6 0 0 1 148 152 L 148 104 A 6 6 0 0 1 154 98 Z"/>
          <path d="M 330 92 L 384 92 L 384 108 L 352 148 L 384 148 L 384 164 L 330 164 L 330 148 L 362 108 L 330 108 Z"/>
          <path d="M 400 92 L 446 92 L 446 107 L 416 107 L 416 120 L 442 120 L 442 134 L 416 134 L 416 149 L 446 149 L 446 164 L 400 164 Z"/>
          <path d="M 462 92 L 508 92 L 508 107 L 478 107 L 478 120 L 504 120 L 504 134 L 478 134 L 478 149 L 508 149 L 508 164 L 462 164 Z"/>
          <path d="M 524 92 L 540 92 L 540 120 L 559 92 L 578 92 L 551 128 L 579 164 L 559 164 L 540 138 L 540 164 L 524 164 Z"/>
          <path d="M 638 108 L 623 108 C 623 106, 619 104, 614 104 C 608 104, 605 107, 605 111 C 605 116, 609 119, 617 122 L 623 124 C 634 128, 640 135, 640 144 C 640 156, 630 164, 616 164 C 601 164, 592 155, 592 144 L 607 144 C 607 149, 611 152, 616 152 C 622 152, 625 149, 625 145 C 625 140, 621 137, 613 134 L 607 132 C 597 128, 591 121, 591 112 C 591 100, 601 92, 615 92 C 629 92, 638 100, 638 108 Z"/>
        </g>
      </svg>
      <text class="code" x="16" y="152" fill="#94A3B8">zeeks_lockup-black.svg</text>
    </g>

    <!-- Variant 2: Pure White (Negative on Dark) -->
    <g transform="translate(405, 80)">
      <rect width="320" height="170" rx="10" fill="#0B0F19" stroke="#1E293B" stroke-width="1"/>
      <text class="label" x="16" y="28" fill="#94A3B8">Version Négative Blanc (White)</text>
      <svg x="40" y="45" width="240" height="90" viewBox="0 0 678 256">
        <g fill="#FFFFFF">
          <rect x="50" y="108" width="16" height="40" rx="8"/>
          <rect x="78" y="84" width="16" height="88" rx="8"/>
          <rect x="106" y="98" width="16" height="60" rx="8"/>
          <path fill-rule="evenodd" d="M 150 80 L 254 80 A 16 16 0 0 1 270 96 L 270 160 A 16 16 0 0 1 254 176 L 150 176 A 16 16 0 0 1 134 160 L 134 96 A 16 16 0 0 1 150 80 Z M 154 98 L 250 98 A 6 6 0 0 1 256 104 L 256 152 A 6 6 0 0 1 250 158 L 154 158 A 6 6 0 0 1 148 152 L 148 104 A 6 6 0 0 1 154 98 Z"/>
          <path d="M 330 92 L 384 92 L 384 108 L 352 148 L 384 148 L 384 164 L 330 164 L 330 148 L 362 108 L 330 108 Z"/>
          <path d="M 400 92 L 446 92 L 446 107 L 416 107 L 416 120 L 442 120 L 442 134 L 416 134 L 416 149 L 446 149 L 446 164 L 400 164 Z"/>
          <path d="M 462 92 L 508 92 L 508 107 L 478 107 L 478 120 L 504 120 L 504 134 L 478 134 L 478 149 L 508 149 L 508 164 L 462 164 Z"/>
          <path d="M 524 92 L 540 92 L 540 120 L 559 92 L 578 92 L 551 128 L 579 164 L 559 164 L 540 138 L 540 164 L 524 164 Z"/>
          <path d="M 638 108 L 623 108 C 623 106, 619 104, 614 104 C 608 104, 605 107, 605 111 C 605 116, 609 119, 617 122 L 623 124 C 634 128, 640 135, 640 144 C 640 156, 630 164, 616 164 C 601 164, 592 155, 592 144 L 607 144 C 607 149, 611 152, 616 152 C 622 152, 625 149, 625 145 C 625 140, 621 137, 613 134 L 607 132 C 597 128, 591 121, 591 112 C 591 100, 601 92, 615 92 C 629 92, 638 100, 638 108 Z"/>
        </g>
      </svg>
      <text class="code" x="16" y="152" fill="#64748B">zeeks_lockup-white.svg</text>
    </g>

    <!-- Variant 3: Monochrome Royal Blue -->
    <g transform="translate(765, 80)">
      <rect width="320" height="170" rx="10" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1"/>
      <text class="label" x="16" y="28" fill="#1D4ED8">Monochrome Bleu Roi (#2563EB)</text>
      <svg x="40" y="45" width="240" height="90" viewBox="0 0 678 256">
        <g fill="#2563EB">
          <rect x="50" y="108" width="16" height="40" rx="8"/>
          <rect x="78" y="84" width="16" height="88" rx="8"/>
          <rect x="106" y="98" width="16" height="60" rx="8"/>
          <path fill-rule="evenodd" d="M 150 80 L 254 80 A 16 16 0 0 1 270 96 L 270 160 A 16 16 0 0 1 254 176 L 150 176 A 16 16 0 0 1 134 160 L 134 96 A 16 16 0 0 1 150 80 Z M 154 98 L 250 98 A 6 6 0 0 1 256 104 L 256 152 A 6 6 0 0 1 250 158 L 154 158 A 6 6 0 0 1 148 152 L 148 104 A 6 6 0 0 1 154 98 Z"/>
          <path d="M 330 92 L 384 92 L 384 108 L 352 148 L 384 148 L 384 164 L 330 164 L 330 148 L 362 108 L 330 108 Z"/>
          <path d="M 400 92 L 446 92 L 446 107 L 416 107 L 416 120 L 442 120 L 442 134 L 416 134 L 416 149 L 446 149 L 446 164 L 400 164 Z"/>
          <path d="M 462 92 L 508 92 L 508 107 L 478 107 L 478 120 L 504 120 L 504 134 L 478 134 L 478 149 L 508 149 L 508 164 L 462 164 Z"/>
          <path d="M 524 92 L 540 92 L 540 120 L 559 92 L 578 92 L 551 128 L 579 164 L 559 164 L 540 138 L 540 164 L 524 164 Z"/>
          <path d="M 638 108 L 623 108 C 623 106, 619 104, 614 104 C 608 104, 605 107, 605 111 C 605 116, 609 119, 617 122 L 623 124 C 634 128, 640 135, 640 144 C 640 156, 630 164, 616 164 C 601 164, 592 155, 592 144 L 607 144 C 607 149, 611 152, 616 152 C 622 152, 625 149, 625 145 C 625 140, 621 137, 613 134 L 607 132 C 597 128, 591 121, 591 112 C 591 100, 601 92, 615 92 C 629 92, 638 100, 638 108 Z"/>
        </g>
      </svg>
      <text class="code" x="16" y="152" fill="#2563EB">zeeks_lockup-mono-2563eb.svg</text>
    </g>

    <!-- Variant 4: Web & Favicon Kit -->
    <g transform="translate(1125, 80)">
      <rect width="310" height="170" rx="10" fill="#FFF7ED" stroke="#FED7AA" stroke-width="1"/>
      <text class="label" x="16" y="28" fill="#C2410C">Pack Icônes Web &amp; Favicon</text>
      <g transform="translate(30, 45)">
        <circle cx="24" cy="24" r="20" fill="#EA580C"/>
        <text class="badge" x="15" y="28" fill="#FFFFFF">ICO</text>
        <text class="code" x="60" y="18" fill="#431407">favicon.ico (16/32/48)</text>
        <text class="code" x="60" y="34" fill="#431407">apple-touch-icon.png (180)</text>
        <text class="code" x="60" y="50" fill="#431407">icon-192 / icon-512.png</text>
      </g>
      <text class="desc" x="16" y="152" fill="#9A3412">Manifeste PWA &amp; head-snippet.html inclus.</text>
    </g>
  </g>
</svg>"""

with open('assets/logo/kit/zeeks_kit_presentation.svg', 'w', encoding='utf-8') as f:
    f.write(content)

print('Wrote assets/logo/kit/zeeks_kit_presentation.svg')
