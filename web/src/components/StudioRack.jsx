import React, { useState, useEffect, useRef } from 'react';
import { studioAudio } from '../utils/audioEngine';
import VuMeterDial from './VuMeterDial';
import LedPeakMeter from './LedPeakMeter';
import StudioKnob from './StudioKnob';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Square, 
  Upload, 
  Radio, 
  Sparkles, 
  Video, 
  Layers, 
  CheckCircle2, 
  Sliders, 
  RefreshCw,
  Volume2,
  HardDrive
} from 'lucide-react';

const PRESET_ARTWORKS = [
  { id: 'neon', title: 'Cyber Waveform', color: 'from-amber-600 to-blue-700', icon: '⚡' },
  { id: 'vinyl', title: 'Studio Vinyl Master', color: 'from-slate-900 via-amber-900 to-slate-950', icon: '💿' },
  { id: 'deepblue', title: 'Acoustic Horizon', color: 'from-blue-900 via-indigo-950 to-slate-900', icon: '🌊' }
];

export default function StudioRack() {
  // Meter Telemetry State
  const [meterData, setMeterData] = useState({
    leftDb: -40,
    rightDb: -40,
    leftPeak: -45,
    rightPeak: -45,
    isPlaying: false
  });

  // Audio Controls State
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState('synthwave');
  const [inputGain, setInputGain] = useState(1.0);
  const [customFileName, setCustomFileName] = useState(null);
  const fileInputRef = useRef(null);

  // ZEEKS Conversion Simulator State
  const [activeTab, setActiveTab] = useState('vu-live'); // 'vu-live' | 'converter'
  const [selectedFormat, setSelectedFormat] = useState('16:9'); // '16:9' | '9:16' | '1:1'
  const [selectedFit, setSelectedFit] = useState('blur'); // 'fill' | 'contain' | 'blur'
  const [selectedArt, setSelectedArt] = useState('neon');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionLogs, setConversionLogs] = useState([]);
  const [conversionDone, setConversionDone] = useState(false);

  // Animation frame loop for real-time VU-Meter updates
  useEffect(() => {
    let animId;
    const pollMeters = () => {
      const data = studioAudio.getMeters();
      setMeterData(data);
      setIsPlaying(data.isPlaying);
      animId = requestAnimationFrame(pollMeters);
    };
    animId = requestAnimationFrame(pollMeters);

    return () => cancelAnimationFrame(animId);
  }, []);

  // Handle Play/Stop Toggle
  const togglePlay = () => {
    if (isPlaying) {
      studioAudio.stop();
      setIsPlaying(false);
    } else {
      studioAudio.playTrack(activeTrack);
      setIsPlaying(true);
    }
  };

  const changeTrack = (trackId) => {
    setActiveTrack(trackId);
    if (isPlaying || trackId === 'sine1k') {
      studioAudio.playTrack(trackId);
      setIsPlaying(true);
    }
  };

  const handleGainChange = (newGain) => {
    setInputGain(newGain);
    studioAudio.setGain(newGain);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setCustomFileName(file.name);
      setActiveTrack('custom');
      await studioAudio.loadCustomFile(file);
      setIsPlaying(true);
    } catch (err) {
      console.error("Erreur de décodage audio:", err);
    }
  };

  // Launch Simulated ZEEKS Local Encoding
  const startConversion = () => {
    if (isConverting) return;
    setIsConverting(true);
    setConversionDone(false);
    setConversionProgress(0);
    setConversionLogs([]);

    // Turn on audio for dynamic needle motion during conversion
    studioAudio.playTrack(activeTrack);
    setIsPlaying(true);

    const logSteps = [
      { p: 10, msg: "Initialisation Windows Media Foundation (IMFSourceReader)..." },
      { p: 25, msg: "Décodage flux audio PCM 48.0 kHz stéréo 32-bit float..." },
      { p: 50, msg: `Composition dynamique de l'image (Format ${selectedFormat}, Cadrage ${selectedFit})...` },
      { p: 75, msg: "Conversion RGB → NV12 (BT.709) & Encodage matériel H.264 High Profile..." },
      { p: 90, msg: "Multiplexage synchrone piste AAC 192 kbps..." },
      { p: 100, msg: "Export terminé avec succès : clip_zeeks.mp4 (1080p @ 30 fps) !" }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < logSteps.length) {
        const step = logSteps[currentStep];
        setConversionProgress(step.p);
        setConversionLogs((prev) => [...prev, step.msg]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsConverting(false);
        setConversionDone(true);
        // Confetti burst
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#EA580C', '#2563EB', '#F97316', '#3B82F6']
        });
      }
    }, 450);
  };

  return (
    <div id="vumeter" className="w-full max-w-6xl mx-auto my-12 px-4">
      {/* 19" Rack Outer Enclosure */}
      <div className="rack-case rounded-2xl overflow-hidden border border-slate-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] bg-gradient-to-b from-[#151D2F] via-[#0E1524] to-[#0A0E18]">
        
        {/* Top Rack Header & Status Bar */}
        <div className="bg-gradient-to-r from-[#111726] via-[#1A2338] to-[#111726] px-6 py-3 border-b border-slate-700/60 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {/* Left Rack Ear Screw */}
            <div className="rack-screw" />
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.8)] animate-pulse" />
              <h3 className="font-display font-extrabold text-sm tracking-wider uppercase text-slate-200">
                ZEEKS MASTERING CONSOLE • MODEL ZK-2026
              </h3>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center bg-[#0B0F19] p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('vu-live')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'vu-live'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              VU-MÈTRE ANALOGIQUE LIVE
            </button>
            <button
              onClick={() => setActiveTab('converter')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'converter'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              SIMULATEUR D'ENCODAGE ZEEKS
            </button>
          </div>

          {/* Right Rack Ear Screw */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 font-semibold hidden sm:inline">
              48.0 kHz • 24-BIT STEREO
            </span>
            <div className="rack-screw" />
          </div>
        </div>

        {/* Central Rack Faceplate: VU-Meters & Fast PPM Meters */}
        <div className="p-6 md:p-8 bg-gradient-to-b from-[#141C2E] to-[#0D1424] relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Channel Analog VU-Meter */}
            <div className="lg:col-span-5 flex justify-center">
              <VuMeterDial
                channel="L"
                dbValue={meterData.leftDb}
                label="CANAL GAUCHE (L)"
                subLabel="ACOUSTIC WAVE"
              />
            </div>

            {/* Center Digital Peak Bargraph */}
            <div className="lg:col-span-2 flex justify-center py-2">
              <LedPeakMeter
                leftPeak={meterData.leftPeak}
                rightPeak={meterData.rightPeak}
              />
            </div>

            {/* Right Channel Analog VU-Meter */}
            <div className="lg:col-span-5 flex justify-center">
              <VuMeterDial
                channel="R"
                dbValue={meterData.rightDb}
                label="CANAL DROIT (R)"
                subLabel="VIDEO SINK 16:9"
              />
            </div>
          </div>

        </div>

        {/* Interactive Bottom Control Bay */}
        <div className="bg-[#0C111E] p-6 border-t border-slate-800/90">
          
          {activeTab === 'vu-live' ? (
            /* Tab 1: Live Studio Synth & Audio Controls */
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                
                {/* Big Master Play/Stop Switch */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className={`px-5 py-3 rounded-xl font-display font-extrabold text-sm tracking-wider uppercase transition-all flex items-center gap-2.5 shadow-xl border ${
                      isPlaying
                        ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                        : 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 border-amber-400 hover:brightness-110 shadow-[0_0_20px_rgba(234,88,12,0.4)]'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Square className="w-4 h-4 fill-current" />
                        ARRÊTER LE GÉNÉRATEUR
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        DÉMARRER LA DÉMO AUDIO
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pl-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-emerald-400 shadow-[0_0_8px_#34D399]' : 'bg-slate-600'}`} />
                    <span>{isPlaying ? 'DSP AUDIO ACTIF' : 'MUTE / PRÊT'}</span>
                  </div>
                </div>

                {/* Potentiometer Input Gain Knob */}
                <div className="flex items-center gap-6 bg-[#131A2B] px-4 py-2 rounded-xl border border-slate-800">
                  <StudioKnob
                    label="GAIN MASTER"
                    value={inputGain}
                    min={0.0}
                    max={1.5}
                    unit="x"
                    onChange={handleGainChange}
                  />
                  <div className="hidden sm:block text-[11px] font-mono text-slate-400 max-w-[130px] leading-tight">
                    Faites glisser le potentiomètre pour faire varier la sensibilité des aiguilles
                  </div>
                </div>

                {/* Custom Audio File Upload */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-[#172136] hover:bg-[#1E2B47] text-slate-200 border border-slate-700 text-xs font-mono font-semibold flex items-center gap-2 transition-all hover:border-amber-500/50"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    {customFileName ? (
                      <span className="truncate max-w-[140px] text-amber-300">{customFileName}</span>
                    ) : (
                      "TESTER AVEC MON MP3 / WAV"
                    )}
                  </button>
                </div>
              </div>

              {/* Synthesizer Track Presets */}
              <div className="bg-[#101726] p-4 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  PISTES DE TEST SYNTHÉTISEUR :
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'synthwave', name: 'Synthwave 80s (122 BPM)', badge: 'BASS & KICK' },
                    { id: 'techno', name: 'Electro Cyber (128 BPM)', badge: 'PUNCHY' },
                    { id: 'ambient', name: 'Ambient Lo-Fi (95 BPM)', badge: 'WARM' },
                    { id: 'sine1k', name: 'Sinus 1 kHz (Calibrage 0 VU)', badge: 'REF 0VU' }
                  ].map((track) => (
                    <button
                      key={track.id}
                      onClick={() => changeTrack(track.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border flex items-center gap-2 ${
                        activeTrack === track.id
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-[0_0_10px_rgba(234,88,12,0.3)]'
                          : 'bg-[#151D2F] text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span>{track.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-slate-400 font-normal">
                        {track.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Tab 2: Interactive ZEEKS Local Converter Simulator */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Step 1: Format de sortie */}
                <div className="bg-[#101726] p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-mono font-bold text-amber-400 tracking-wider uppercase block mb-3">
                    01. FORMAT VIDÉO CIBLE
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '16:9', label: '16:9', desc: 'YouTube / PC' },
                      { id: '9:16', label: '9:16', desc: 'TikTok / Reels' },
                      { id: '1:1', label: '1:1', desc: 'Square / Post' }
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        onClick={() => setSelectedFormat(fmt.id)}
                        className={`p-2 rounded-lg text-center border transition-all ${
                          selectedFormat === fmt.id
                            ? 'bg-blue-600/30 border-blue-500 text-white shadow-lg'
                            : 'bg-[#151E32] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-mono font-extrabold text-sm text-slate-100">{fmt.label}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">{fmt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Cadrage de l'image */}
                <div className="bg-[#101726] p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-mono font-bold text-blue-400 tracking-wider uppercase block mb-3">
                    02. CADRAGE & VISUEL
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'blur', label: 'Fond flou', desc: 'Ambiance 4K' },
                      { id: 'fill', label: 'Remplir', desc: 'Plein écran' },
                      { id: 'contain', label: 'Contenir', desc: 'Bandes noires' }
                    ].map((fit) => (
                      <button
                        key={fit.id}
                        onClick={() => setSelectedFit(fit.id)}
                        className={`p-2 rounded-lg text-center border transition-all ${
                          selectedFit === fit.id
                            ? 'bg-amber-600/30 border-amber-500 text-white shadow-lg'
                            : 'bg-[#151E32] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-mono font-bold text-xs text-slate-100">{fit.label}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">{fit.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Visuel de couverture */}
                <div className="bg-[#101726] p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-mono font-bold text-slate-300 tracking-wider uppercase block mb-3">
                    03. CHOIX COVER ART
                  </span>
                  <div className="flex gap-2">
                    {PRESET_ARTWORKS.map((art) => (
                      <button
                        key={art.id}
                        onClick={() => setSelectedArt(art.id)}
                        className={`flex-1 p-2 rounded-lg text-center border transition-all ${
                          selectedArt === art.id
                            ? 'bg-slate-700/60 border-slate-400 shadow-md ring-1 ring-amber-400'
                            : 'bg-[#151E32] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-base">{art.icon}</div>
                        <div className="text-[9px] font-mono text-slate-300 truncate mt-1">{art.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Trigger & Real-time Encoding Stream */}
              <div className="bg-[#0D1422] p-5 rounded-xl border border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={startConversion}
                      disabled={isConverting}
                      className={`px-6 py-3 rounded-xl font-display font-extrabold text-sm tracking-wider uppercase transition-all flex items-center gap-2 shadow-xl border ${
                        isConverting
                          ? 'bg-slate-700 text-slate-400 border-slate-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                      }`}
                    >
                      {isConverting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          ENCODAGE EN COURS ({conversionProgress}%)...
                        </>
                      ) : (
                        <>
                          <Video className="w-4 h-4" />
                          LANCER LA CONVERSION ZEEKS
                        </>
                      )}
                    </button>

                    <span className="text-xs font-mono text-slate-400">
                      Vitesse mesurée : 30 s de MP4 générées en ~2 secondes
                    </span>
                  </div>

                  {conversionDone && (
                    <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/80">
                      <CheckCircle2 className="w-4 h-4" />
                      VIDÉO PRÊTE (clip_zeeks.mp4) !
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#141C2E] h-3 rounded-full overflow-hidden border border-slate-800 mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-blue-500 transition-all duration-300 rounded-full"
                    style={{ width: `${conversionProgress}%` }}
                  />
                </div>

                {/* Live Console Output Log */}
                <div className="bg-[#070A11] p-3 rounded-lg border border-slate-900 font-mono text-[11px] text-slate-400 max-h-24 overflow-y-auto space-y-1">
                  {conversionLogs.length === 0 ? (
                    <span className="text-slate-600">
                      Appuyez sur "Lancer la conversion ZEEKS" pour voir le pipeline Media Foundation en action.
                    </span>
                  ) : (
                    conversionLogs.map((log, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-amber-500">›</span>
                        <span className={idx === conversionLogs.length - 1 ? 'text-emerald-300 font-semibold' : 'text-slate-300'}>
                          {log}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
