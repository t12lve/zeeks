import React, { useEffect, useState } from 'react';

const LED_LEVELS = [
  { db: 4, label: 'CLIP', color: 'red' },
  { db: 3, label: '+3', color: 'red' },
  { db: 2, label: '+2', color: 'red' },
  { db: 1, label: '+1', color: 'red' },
  { db: 0, label: '0', color: 'amber' },
  { db: -1, label: '-1', color: 'amber' },
  { db: -2, label: '-2', color: 'amber' },
  { db: -4, label: '-4', color: 'amber' },
  { db: -7, label: '-7', color: 'amber' },
  { db: -10, label: '-10', color: 'green' },
  { db: -14, label: '-14', color: 'green' },
  { db: -18, label: '-18', color: 'green' },
  { db: -24, label: '-24', color: 'green' },
  { db: -30, label: '-30', color: 'green' },
  { db: -36, label: '-36', color: 'green' },
  { db: -42, label: '-42', color: 'green' },
];

export default function LedPeakMeter({ leftPeak = -45, rightPeak = -45 }) {
  const [peakHoldL, setPeakHoldL] = useState(-50);
  const [peakHoldR, setPeakHoldR] = useState(-50);

  useEffect(() => {
    if (leftPeak > peakHoldL) {
      setPeakHoldL(leftPeak);
    }
    if (rightPeak > peakHoldR) {
      setPeakHoldR(rightPeak);
    }

    const timer = setInterval(() => {
      setPeakHoldL((prev) => Math.max(-50, prev - 1.5));
      setPeakHoldR((prev) => Math.max(-50, prev - 1.5));
    }, 100);

    return () => clearInterval(timer);
  }, [leftPeak, rightPeak, peakHoldL, peakHoldR]);

  const getLedState = (thresholdDb, currentDb, holdDb) => {
    const isLit = currentDb >= thresholdDb;
    const isHold = Math.abs(holdDb - thresholdDb) <= 1.5 && holdDb >= thresholdDb;
    return { isLit, isHold };
  };

  const getSegmentStyle = (color, isLit, isHold) => {
    if (!isLit && !isHold) {
      // Unlit LED appearance
      return 'bg-slate-900/90 border border-slate-800/40 opacity-40';
    }

    if (color === 'red') {
      return isLit 
        ? 'bg-red-500 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.9)] opacity-100'
        : 'bg-red-500/80 shadow-[0_0_4px_rgba(239,68,68,0.6)] opacity-90';
    } else if (color === 'amber') {
      return isLit 
        ? 'bg-amber-500 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.9)] opacity-100'
        : 'bg-amber-500/80 shadow-[0_0_4px_rgba(245,158,11,0.6)] opacity-90';
    } else {
      return isLit 
        ? 'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.9)] opacity-100'
        : 'bg-emerald-400/80 shadow-[0_0_4px_rgba(52,211,153,0.6)] opacity-90';
    }
  };

  return (
    <div className="bg-[#0B0F19] p-3 rounded-xl border border-slate-800/80 shadow-2xl flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2">
        <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">PEAK L/R</span>
        <span className="text-[9px] font-mono text-emerald-400 font-semibold">FAST PPM</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Left LED Column */}
        <div className="flex flex-col gap-1">
          {LED_LEVELS.map((lvl) => {
            const { isLit, isHold } = getLedState(lvl.db, leftPeak, peakHoldL);
            return (
              <div
                key={`L-${lvl.db}`}
                className={`w-5 h-2 rounded-[2px] transition-all duration-75 ${getSegmentStyle(
                  lvl.color,
                  isLit,
                  isHold
                )}`}
              />
            );
          })}
        </div>

        {/* Center dB Scale Numbers */}
        <div className="flex flex-col gap-1 items-center px-1">
          {LED_LEVELS.map((lvl) => (
            <span
              key={`lbl-${lvl.db}`}
              className={`h-2 text-[8px] font-mono font-bold leading-[8px] ${
                lvl.color === 'red'
                  ? 'text-red-400'
                  : lvl.color === 'amber'
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }`}
            >
              {lvl.label}
            </span>
          ))}
        </div>

        {/* Right LED Column */}
        <div className="flex flex-col gap-1">
          {LED_LEVELS.map((lvl) => {
            const { isLit, isHold } = getLedState(lvl.db, rightPeak, peakHoldR);
            return (
              <div
                key={`R-${lvl.db}`}
                className={`w-5 h-2 rounded-[2px] transition-all duration-75 ${getSegmentStyle(
                  lvl.color,
                  isLit,
                  isHold
                )}`}
              />
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800/60 text-[9px] font-mono text-slate-400 font-bold">
        <span>L</span>
        <span>dBFS</span>
        <span>R</span>
      </div>
    </div>
  );
}
