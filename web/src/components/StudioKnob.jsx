import React, { useState, useRef, useEffect } from 'react';

export default function StudioKnob({
  label = "INPUT GAIN",
  value = 1.0,
  min = 0.0,
  max = 1.5,
  unit = "x",
  onChange = () => {}
}) {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startVal = useRef(value);

  // Map value to rotation angle (-135 deg to +135 deg = 270 deg range)
  const angle = ((value - min) / (max - min)) * 270 - 135;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startVal.current = value;
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaY = startY.current - e.clientY;
      const range = max - min;
      const deltaVal = (deltaY / 150) * range;
      const newVal = Math.max(min, Math.min(max, startVal.current + deltaVal));
      onChange(Number(newVal.toFixed(2)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, min, max, onChange]);

  return (
    <div className="flex flex-col items-center select-none group">
      {/* Knob Dial Container */}
      <div 
        className="relative cursor-ns-resize flex items-center justify-center p-2"
        onMouseDown={handleMouseDown}
        title="Glissez verticalement pour ajuster le gain"
      >
        {/* Outer Bezel with tick markers */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#253248] to-[#0E1522] p-1 shadow-lg border border-slate-700/80 flex items-center justify-center relative">
          
          {/* Subtle tick ring markings */}
          <div className="absolute inset-[-4px] rounded-full border border-dashed border-slate-700/50 pointer-events-none" />

          {/* Brushed Metal Knob Body */}
          <div 
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#1E293B] via-[#334155] to-[#1E293B] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_3px_6px_rgba(0,0,0,0.8)] border border-slate-600/60 relative flex items-center justify-center transition-transform"
            style={{ transform: `rotate(${angle}deg)` }}
          >
            {/* Fine concentric brushed rings */}
            <div className="w-8 h-8 rounded-full border border-slate-500/20" />
            
            {/* Indicator Needle Notch */}
            <div className="absolute top-1 w-1 h-3 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(234,88,12,0.9)]" />
          </div>
        </div>
      </div>

      {/* Label and Value */}
      <span className="text-[10px] font-mono font-bold tracking-wider text-slate-300 mt-1 uppercase">
        {label}
      </span>
      <span className="text-[11px] font-mono text-amber-400 font-bold bg-[#0B0F19] px-2 py-0.5 rounded border border-slate-800 mt-0.5">
        {value.toFixed(2)}{unit}
      </span>
    </div>
  );
}
