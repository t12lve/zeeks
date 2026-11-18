import React, { useEffect, useRef } from 'react';

// Maps dB values (-20 to +3 VU) to needle angles (-45 deg to +38 deg)
function dbToAngle(db) {
  if (db <= -20) return -45;
  if (db >= 3) return 38;

  // Logarithmic expansion matching ANSI standard VU meter response
  if (db <= -10) {
    return -45 + ((db + 20) / 10) * 16;
  } else if (db <= -3) {
    return -29 + ((db + 10) / 7) * 20;
  } else if (db <= 0) {
    return -9 + ((db + 3) / 3) * 15;
  } else {
    return 6 + (db / 3) * 32;
  }
}

export default function VuMeterDial({
  channel = "L",
  dbValue = -20,
  label = "Canal gauche",
}) {
  const needleRef = useRef(null);
  const shadowRef = useRef(null);
  const currentAngle = useRef(-45);
  const velocity = useRef(0);
  const animFrameId = useRef(null);

  // Ballistics loop (Simulates genuine mechanical d'Arsonval movement)
  useEffect(() => {
    let running = true;
    const targetAngle = dbToAngle(dbValue);

    // Realistic needle inertia
    const stiffness = 0.20;
    const damping = 0.70;

    const updateNeedle = () => {
      if (!running) return;

      const delta = targetAngle - currentAngle.current;
      velocity.current = (velocity.current + delta * stiffness) * damping;
      currentAngle.current += velocity.current;

      // Mechanical end-stops
      if (currentAngle.current < -48) {
        currentAngle.current = -48;
        velocity.current = 0;
      } else if (currentAngle.current > 42) {
        currentAngle.current = 42;
        velocity.current = 0;
      }

      if (needleRef.current && shadowRef.current) {
        needleRef.current.setAttribute(
          'transform',
          `rotate(${currentAngle.current.toFixed(2)}, 160, 155)`
        );
        shadowRef.current.setAttribute(
          'transform',
          `rotate(${currentAngle.current.toFixed(2)}, 162, 157)`
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
    <div className="flex flex-col items-center w-full">
      {/* Matte Instrument Frame */}
      <div className="w-full max-w-[320px] bg-[#161922] p-2 rounded-xl border border-white/10 shadow-lg">
        
        {/* Dial Face Plate */}
        <div className="relative overflow-hidden rounded-lg bg-[#FAF8F2] border border-[#E2DDD3]">
          
          <svg
            viewBox="0 0 320 170"
            className="w-full h-auto block select-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Red Overload Zone Arc (0 VU to +3 VU) */}
            <path
              d="M 166 43 A 115 115 0 0 1 230 76"
              fill="none"
              stroke="#DC2626"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Black Scale Arc (-20 VU to 0 VU) */}
            <path
              d="M 86 78 A 115 115 0 0 1 166 43"
              fill="none"
              stroke="#1E293B"
              strokeWidth="2"
            />

            {/* Tick Marks and Labels */}
            {/* -20 */}
            <line x1="88" y1="80" x2="96" y2="86" stroke="#1E293B" strokeWidth="2" />
            <text x="86" y="99" fontSize="9.5" fontWeight="600" fill="#334155" textAnchor="middle" fontFamily="JetBrains Mono, monospace">-20</text>

            {/* -10 */}
            <line x1="108" y1="65" x2="115" y2="73" stroke="#1E293B" strokeWidth="2" />
            <text x="108" y="86" fontSize="9.5" fontWeight="600" fill="#334155" textAnchor="middle" fontFamily="JetBrains Mono, monospace">-10</text>

            {/* -7 */}
            <line x1="124" y1="56" x2="130" y2="65" stroke="#1E293B" strokeWidth="1.5" />
            <text x="124" y="77" fontSize="9" fontWeight="500" fill="#475569" textAnchor="middle" fontFamily="JetBrains Mono, monospace">-7</text>

            {/* -5 */}
            <line x1="138" y1="50" x2="142" y2="59" stroke="#1E293B" strokeWidth="1.5" />
            <text x="139" y="71" fontSize="9" fontWeight="500" fill="#475569" textAnchor="middle" fontFamily="JetBrains Mono, monospace">-5</text>

            {/* -3 */}
            <line x1="152" y1="46" x2="155" y2="55" stroke="#1E293B" strokeWidth="2" />
            <text x="154" y="67" fontSize="9.5" fontWeight="600" fill="#334155" textAnchor="middle" fontFamily="JetBrains Mono, monospace">-3</text>

            {/* 0 VU */}
            <line x1="178" y1="43" x2="178" y2="54" stroke="#DC2626" strokeWidth="2.5" />
            <text x="178" y="66" fontSize="10.5" fontWeight="700" fill="#DC2626" textAnchor="middle" fontFamily="JetBrains Mono, monospace">0</text>

            {/* +1 */}
            <line x1="192" y1="46" x2="189" y2="55" stroke="#DC2626" strokeWidth="1.5" />
            <text x="194" y="69" fontSize="9" fontWeight="600" fill="#DC2626" textAnchor="middle" fontFamily="JetBrains Mono, monospace">+1</text>

            {/* +2 */}
            <line x1="205" y1="51" x2="200" y2="60" stroke="#DC2626" strokeWidth="1.5" />
            <text x="209" y="74" fontSize="9" fontWeight="600" fill="#DC2626" textAnchor="middle" fontFamily="JetBrains Mono, monospace">+2</text>

            {/* +3 */}
            <line x1="218" y1="58" x2="212" y2="67" stroke="#DC2626" strokeWidth="2" />
            <text x="225" y="80" fontSize="10" fontWeight="700" fill="#DC2626" textAnchor="middle" fontFamily="JetBrains Mono, monospace">+3</text>

            {/* Dial Text */}
            <text x="160" y="98" fontSize="13" fontWeight="700" fill="#1E293B" textAnchor="middle" letterSpacing="1" fontFamily="sans-serif">
              VU
            </text>
            <text x="160" y="112" fontSize="7.5" fontWeight="500" fill="#64748B" textAnchor="middle" letterSpacing="0.5" fontFamily="sans-serif">
              ZEEKS AUDIO
            </text>

            {/* Needle Shadow */}
            <g ref={shadowRef} transform="rotate(-45, 162, 157)">
              <line x1="162" y1="157" x2="162" y2="38" stroke="rgba(0,0,0,0.12)" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Active Needle */}
            <g ref={needleRef} transform="rotate(-45, 160, 155)">
              <line x1="160" y1="155" x2="160" y2="35" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="160" y1="44" x2="160" y2="35" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
              <line x1="160" y1="155" x2="160" y2="164" stroke="#0F172A" strokeWidth="2.5" />
            </g>

            {/* Pivot Center Boss */}
            <circle cx="160" cy="155" r="14" fill="#1E293B" />
            <circle cx="160" cy="155" r="8" fill="#475569" />
            <circle cx="160" cy="155" r="3" fill="#0F172A" />
          </svg>
        </div>

        {/* Channel Label */}
        <div className="flex items-center justify-between px-1 pt-2 text-[11px] font-mono text-slate-400">
          <span>{label}</span>
          <span className="tabular-nums font-medium text-slate-300">
            {dbValue > -40 ? `${dbValue.toFixed(1)} dB` : "-∞ dB"}
          </span>
        </div>

      </div>
    </div>
  );
}
