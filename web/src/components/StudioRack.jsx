import React, { useState, useEffect, useRef } from 'react';
import { studioAudio } from '../utils/audioEngine';
import VuMeterDial from './VuMeterDial';
import { Play, Pause, Upload, Check, Video, ArrowRight } from 'lucide-react';

export default function StudioRack() {
  const [meterData, setMeterData] = useState({
    leftDb: -40,
    rightDb: -40,
    isPlaying: false
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState('lofi');
  const [volume, setVolume] = useState(0.85);
  const [customFile, setCustomFile] = useState(null);
  const fileInputRef = useRef(null);

  // Video format preview state
  const [format, setFormat] = useState('16:9'); // '16:9' | '9:16' | '1:1'
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);

  // Meter update loop
  useEffect(() => {
    let animId;
    const poll = () => {
      const data = studioAudio.getMeters();
      setMeterData(data);
      setIsPlaying(data.isPlaying);
      animId = requestAnimationFrame(poll);
    };
    animId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(animId);
  }, []);

  const togglePlayback = () => {
    if (isPlaying) {
      studioAudio.stop();
      setIsPlaying(false);
    } else {
      studioAudio.playTrack(activeTrack);
      setIsPlaying(true);
    }
  };

  const handleTrackChange = (track) => {
    setActiveTrack(track);
    if (isPlaying) {
      studioAudio.playTrack(track);
    }
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    studioAudio.setGain(v);
  };

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCustomFile(f.name);
    setActiveTrack('custom');
    await studioAudio.loadCustomFile(f);
    setIsPlaying(true);
  };

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimProgress(0);

    if (!isPlaying) {
      studioAudio.playTrack(activeTrack);
      setIsPlaying(true);
    }

    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setSimProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => setIsSimulating(false), 800);
      }
    }, 120);
  };

  return (
    <section id="vumeter" className="max-w-4xl mx-auto px-6 my-10">
      
      {/* Console Box */}
      <div className="bg-[#12151D] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Console Header */}
        <div className="px-6 py-3.5 border-b border-white/[0.07] bg-white/[0.02] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full transition-colors ${isPlaying ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <span className="font-mono text-slate-300 font-medium">
              {isPlaying ? 'Signal audio en cours' : 'Moniteur audio en veille'}
            </span>
          </div>
          <div className="text-slate-500 font-mono hidden sm:inline">
            Stéréo 48 kHz · Calibré ANSI C16.5
          </div>
        </div>

        {/* Meters Display Row */}
        <div className="p-6 sm:p-8 bg-[#0E1017]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center justify-center max-w-2xl mx-auto">
            <VuMeterDial
              channel="L"
              dbValue={meterData.leftDb}
              label="Canal gauche (L)"
            />
            <VuMeterDial
              channel="R"
              dbValue={meterData.rightDb}
              label="Canal droit (R)"
            />
          </div>
        </div>

        {/* Interactive Controls Bar */}
        <div className="p-6 border-t border-white/[0.06] bg-[#12151D] space-y-6">
          
          {/* Audio Player Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Play/Pause & Tracks */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={togglePlayback}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center gap-2"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Écouter'}</span>
              </button>

              <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-slate-400">
                <button
                  onClick={() => handleTrackChange('lofi')}
                  className={`px-2.5 py-1 rounded transition-colors ${activeTrack === 'lofi' ? 'bg-white/10 text-slate-100 font-medium' : 'hover:text-slate-200'}`}
                >
                  Lo-Fi
                </button>
                <button
                  onClick={() => handleTrackChange('synthwave')}
                  className={`px-2.5 py-1 rounded transition-colors ${activeTrack === 'synthwave' ? 'bg-white/10 text-slate-100 font-medium' : 'hover:text-slate-200'}`}
                >
                  Synthwave
                </button>
                <button
                  onClick={() => handleTrackChange('sine1k')}
                  className={`px-2.5 py-1 rounded transition-colors ${activeTrack === 'sine1k' ? 'bg-white/10 text-slate-100 font-medium' : 'hover:text-slate-200'}`}
                >
                  Test 1 kHz
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFile}
                accept="audio/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-colors flex items-center gap-1.5"
                title="Charger un fichier audio de votre ordinateur"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">
                  {customFile || 'Importer audio'}
                </span>
              </button>
            </div>

            {/* Gain Volume Slider */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>Volume</span>
              <input
                type="range"
                min="0"
                max="1.2"
                step="0.05"
                value={volume}
                onChange={handleVolume}
                className="w-20 accent-blue-500 cursor-pointer"
              />
              <span className="w-8 tabular-nums">
                {Math.round(volume * 100)}%
              </span>
            </div>

          </div>

          {/* Video Aspect Ratio & Simulated Conversion */}
          <div className="pt-5 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">Format de sortie :</span>
              <div className="flex items-center gap-1 text-xs">
                {['16:9', '9:16', '1:1'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`px-3 py-1 rounded-md transition-colors ${format === f ? 'bg-white/10 text-slate-100 font-semibold border border-white/20' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="px-3.5 py-1.5 rounded-lg border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-200 transition-colors flex items-center gap-2"
            >
              <Video className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {isSimulating ? `Encodage... ${simProgress} %` : 'Simuler la conversion MP4'}
              </span>
            </button>

          </div>

          {/* Conversion Simulated Progress Bar */}
          {isSimulating && (
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-blue-500 h-full transition-all duration-100"
                style={{ width: `${simProgress}%` }}
              />
            </div>
          )}

        </div>

      </div>

    </section>
  );
}
