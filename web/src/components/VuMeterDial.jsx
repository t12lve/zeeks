import React, { useEffect, useRef } from 'react';

// Maps dB values (-20 to +3 VU) to needle angles (-46 deg to +38 deg)
function dbToAngle(db) {
  if (db <= -20) return -46;
  if (db >= 3) return 38;

  // Non-linear VU curve (ANSI C16.5 logarithmic expansion)
  if (db <= -10) {
    // -20 to -10 -> -46 to -30
    return -46 + ((db + 20) / 10) * 16;
  } else if (db <= -3) {
    // -10 to -3 -> -30 to -9
    return -30 + ((db + 10) / 7) * 21;
  } else if (db <= 0) {
    // -3 to 0 -> -9 to +6
    return -9 + ((db + 3) / 3) * 15;
  } else {
    // 0 to +3 -> +6 to +38 (expanded red zone)
    return 6 + (db / 3) * 32;
  }
}

export default function VuMeterDial({
  channel = "L",
  dbValue = -20,
  label = "CH 1",
  subLabel = "MASTER OUT",
  peakHold = false
}) {
  const needleRef = useRef(null);
  const shadowRef = useRef(null);
  const currentAngle = useRef(-46);
  const velocity = useRef(0);
  const animFrameId = useRef(null);

  // Ballistics loop (Simulates genuine mechanical d'Arsonval movement)
  useEffect(() => {
    let running = true;
    const targetAngle = dbToAngle(dbValue);

    // Spring parameters
    const stiffness = 0.18; // Attack speed
    const damping = 0.72;   // Inertia & natural overshoot

    const updateNeedle = () => {
      if (!running) return;

      const delta = targetAngle - currentAngle.current;
      velocity.current = (velocity.current + delta * stiffness) * damping;
      currentAngle.current += velocity.current;

      // Clamp needle to physical end-stops
      if (currentAngle.current < -50) {
        currentAngle.current = -50;
        velocity.current = 0;
      } else if (currentAngle.current > 42) {
        currentAngle.current = 42;
        velocity.current = 0;
      }

      if (needleRef.current && shadowRef.current) {
        needleRef.current.setAttribute(
          'transform',
          `rotate(${currentAngle.current.toFixed(2)}, 160, 160)`
        );
        // Cast shadow offset
        shadowRef.current.setAttribute(
          'transform',
          `rotate(${currentAngle.current.toFixed(2)}, 163, 162)`
        );
      }

      animFrameId.current = requestAnimationFrame(updateNeedle);
    };

    animFrameId.current = requestAnimationFrame(updateNeedle);

    return () => {
      running = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [dbValue]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Outer Meter Bezel with Screws and Chamfer */}
      <div className="vu-meter-bezel p-1.5 w-full max-w-[340px] bg-gradient-to-b from-[#1E273A] via-[#101726] to-[#0A0E17] rounded-xl shadow-2xl border border-slate-700/60">
        
        {/* Dial Face Inner Frame */}
        <div className="relative overflow-hidden rounded-lg bg-[#FAF7EE] shadow-inner border border-amber-900/30">
          
          {/* Warm Amber Studio Backlight Overlay */}
          <div className="absolute inset-0 vu-meter-backlight pointer-events-none opacity-80" />
          
          {/* Soft Vignette and Texture */}
          <div className="absolute inset-0 bg-radial from-transparent via-amber-100/10 to-amber-900/20 pointer-events-none" />

          {/* SVG Dial Face Graphics */}
          <svg
            viewBox="0 0 320 180"
            className="w-full h-auto block select-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Dial Scale Gradients */}
              <linearGradient id="meterFaceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFDF7" />
                <stop offset="100%" stopColor="#F5EFE0" />
              </linearGradient>
              <linearGradient id="needleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="70%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
            </defs>

            {/* Dial Background Base */}
            <rect width="320" height="180" fill="url(#meterFaceGrad)" />

            {/* Red Overload Zone Arc (0 VU to +3 VU) */}
            <path
              d="M 166 43 A 120 120 0 0 1 236 78"
              fill="none"
              stroke="#DC2626"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* Black Normal Scale Arc (-20 VU to 0 VU) */}
            <path
              d="M 80 82 A 120 120 0 0 1 166 43"
              fill="none"
              stroke="#1E293B"
              strokeWidth="2.5"
            />

            {/* Calibrated Tick Marks and Labels */}
            {/* -20 */}
            <line x1="84" y1="84" x2="94" y2="90" stroke="#1E293B" strokeWidth="2.5" />
            <text x="80" y="104" fontSize="10" fontWeight="700" fill="#1E293B" textAnchor="middle" fontFamily="monospace">-20</text>

            {/* -10 */}
            <line x1="106" y1="67" x2="114" y2="76" stroke="#1E293B" strokeWidth="2.5" />
            <text x="106" y="87" fontSize="10" fontWeight="700" fill="#1E293B" textAnchor="middle" fontFamily="monospace">-10</text>

            {/* -7 */}
            <line x1="122" y1="58" x2="128" y2="67" stroke="#1E293B" strokeWidth="1.8" />
            <text x="123" y="78" fontSize="9.5" fontWeight="600" fill="#1E293B" textAnchor="middle" fontFamily="monospace">-7</text>

            {/* -5 */}
            <line x1="137" y1="51" x2="141" y2="61" stroke="#1E293B" strokeWidth="1.8" />
            <text x="139" y="72" fontSize="9.5" fontWeight="600" fill="#1E293B" textAnchor="middle" fontFamily="monospace">-5</text>

            {/* -3 */}
            <line x1="152" y1="46" x2="155" y2="56" stroke="#1E293B" strokeWidth="2.2" />
            <text x="154" y="68" fontSize="10" fontWeight="700" fill="#1E293B" textAnchor="middle" fontFamily="monospace">-3</text>

            {/* -2 */}
            <line x1="162" y1="44" x2="164" y2="54" stroke="#1E293B" strokeWidth="1.5" />

            {/* -1 */}
            <line x1="171" y1="43" x2="172" y2="53" stroke="#1E293B" strokeWidth="1.5" />

            {/* 0 VU (100% Modulation reference) */}
            <line x1="181" y1="43" x2="181" y2="55" stroke="#DC2626" strokeWidth="3" />
            <text x="181" y="67" fontSize="11" fontWeight="800" fill="#DC2626" textAnchor="middle" fontFamily="monospace">0</text>

            {/* +1 */}
            <line x1="195" y1="46" x2="192" y2="56" stroke="#DC2626" strokeWidth="1.8" />
            <text x="198" y="70" fontSize="9.5" fontWeight="700" fill="#DC2626" textAnchor="middle" fontFamily="monospace">+1</text>

            {/* +2 */}
            <line x1="209" y1="51" x2="204" y2="61" stroke="#DC2626" strokeWidth="1.8" />
            <text x="214" y="75" fontSize="9.5" fontWeight="700" fill="#DC2626" textAnchor="middle" fontFamily="monospace">+2</text>

            {/* +3 */}
            <line x1="223" y1="59" x2="216" y2="68" stroke="#DC2626" strokeWidth="2.5" />
            <text x="231" y="82" fontSize="10" fontWeight="800" fill="#DC2626" textAnchor="middle" fontFamily="monospace">+3</text>

            {/* Studio Branding on Dial */}
            <text x="160" y="105" fontSize="14" fontWeight="800" fill="#0F172A" textAnchor="middle" letterSpacing="2" fontFamily="sans-serif">
              VU
            </text>
            <text x="160" y="118" fontSize="7" fontWeight="600" fill="#64748B" textAnchor="middle" letterSpacing="1" fontFamily="sans-serif">
              ZEEKS AUDIO LABS • BALANCED
            </text>

            {/* Channel Badge */}
            <g transform="translate(144, 124)">
              <rect width="32" height="12" rx="3" fill="#1E293B" />
              <text x="16" y="9" fontSize="8" fontWeight="700" fill="#EA580C" textAnchor="middle" fontFamily="monospace">
                CH-{channel}
              </text>
            </g>

            {/* Cast Needle Shadow (offset by 3px) */}
            <g ref={shadowRef} transform="rotate(-46, 163, 162)">
              <line x1="163" y1="162" x2="163" y2="35" stroke="rgba(0,0,0,0.18)" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Active Physical Needle */}
            <g ref={needleRef} transform="rotate(-46, 160, 160)">
              {/* Tapered needle rod */}
              <line x1="160" y1="160" x2="160" y2="32" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
              {/* Needle Tip Highlight */}
              <line x1="160" y1="42" x2="160" y2="32" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
              {/* Counter-weight tail */}
              <line x1="160" y1="160" x2="160" y2="170" stroke="#0F172A" strokeWidth="2.5" />
            </g>

            {/* Pivot Center Boss & Screw */}
            <circle cx="160" cy="160" r="16" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
            <circle cx="160" cy="160" r="10" fill="#334155" />
            <circle cx="160" cy="160" r="4" fill="#0F172A" />
            <line x1="158" y1="160" x2="162" y2="160" stroke="#64748B" strokeWidth="1" />
          </svg>

          {/* Glass Convex Reflection */}
          <div className="absolute inset-0 vu-meter-glass rounded-lg pointer-events-none" />
        </div>

        {/* Channel Plate Footer */}
        <div className="mt-2 px-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(234,88,12,0.8)] animate-pulse" />
            <span className="font-mono text-[10px] tracking-wider text-slate-300 font-semibold">{label}</span>
          </div>
          <span className="font-mono text-[10px] text-amber-400/90 font-medium">{subLabel}</span>
          <div className="font-mono text-[11px] font-bold text-slate-200">
            {dbValue > -35 ? `${dbValue > 0 ? '+' : ''}${dbValue.toFixed(1)} dB` : '-∞ dB'}
          </div>
        </div>
      </div>
    </div>
  );
}
