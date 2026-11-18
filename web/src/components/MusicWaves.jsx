import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { studioAudio } from '../utils/audioEngine';
import { Play, Pause, Upload, Volume2 } from 'lucide-react';

export default function MusicWaves() {
  const mountRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState('lofi');
  const [volume, setVolume] = useState(0.85);
  const [customFile, setCustomFile] = useState(null);
  const [format, setFormat] = useState('16:9'); // '16:9' | '9:16' | '1:1'
  const fileInputRef = useRef(null);

  // References for Three.js animation
  const linesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const freqDataRef = useRef(new Uint8Array(128));

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

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 360;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0d13);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 48, 140);
    camera.lookAt(0, 0, -10);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Parameters for Minimalist Waveforms
    const NUM_LINES = 26;
    const POINTS_PER_LINE = 100;
    const LINE_WIDTH = 220;
    const DEPTH_SPACING = 7.5;

    const lineObjects = [];

    // Color definitions
    const amberColor = new THREE.Color(0xea580c); // ZEEKS brand orange
    const blueColor = new THREE.Color(0x2563eb);  // ZEEKS brand royal blue
    const whiteColor = new THREE.Color(0xf1f5f9);

    for (let i = 0; i < NUM_LINES; i++) {
      const z = (i - NUM_LINES / 2) * DEPTH_SPACING;
      const positions = new Float32Array(POINTS_PER_LINE * 3);
      const colors = new Float32Array(POINTS_PER_LINE * 3);

      const depthFactor = 1 - (i / NUM_LINES) * 0.7; // Closer lines are brighter

      for (let j = 0; j < POINTS_PER_LINE; j++) {
        const x = (j / (POINTS_PER_LINE - 1) - 0.5) * LINE_WIDTH;
        positions[j * 3] = x;
        positions[j * 3 + 1] = 0;
        positions[j * 3 + 2] = z;

        const distFromCenter = Math.abs(j / (POINTS_PER_LINE - 1) - 0.5) * 2; // 0 (center) to 1 (edges)

        let pointColor = new THREE.Color();
        if (distFromCenter < 0.28) {
          // Center crest: warm amber to crisp white
          pointColor.lerpColors(amberColor, whiteColor, (0.28 - distFromCenter) / 0.28);
        } else {
          // Flanks: royal blue fading out
          pointColor.lerpColors(blueColor, whiteColor, 0.2);
        }

        const edgeDim = Math.max(0.15, 1 - Math.pow(distFromCenter, 1.8));
        const finalBrightness = depthFactor * edgeDim;

        colors[j * 3] = pointColor.r * finalBrightness;
        colors[j * 3 + 1] = pointColor.g * finalBrightness;
        colors[j * 3 + 2] = pointColor.b * finalBrightness;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: Math.max(0.25, depthFactor),
        linewidth: 1,
      });

      const line = new THREE.Line(geometry, material);
      scene.add(line);
      lineObjects.push({ line, geometry, z, index: i });
    }

    linesRef.current = lineObjects;

    // ResizeObserver ensures canvas always fills the container accurately
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Mouse interaction listener
    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x * 12;
      mouseRef.current.targetY = y * 8;
    };
    container.addEventListener('pointermove', onPointerMove);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse camera interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      camera.position.x = mouseRef.current.x;
      camera.position.y = 48 + mouseRef.current.y;
      camera.lookAt(0, 0, -10);

      // Get real audio frequency data
      studioAudio.getFrequencyData(freqDataRef.current);
      const isAudioActive = studioAudio.isPlaying;

      // Update wave geometry vertices
      for (let i = 0; i < lineObjects.length; i++) {
        const { geometry, index } = lineObjects[i];
        const posAttr = geometry.attributes.position;
        const array = posAttr.array;

        const lineRatio = index / NUM_LINES;
        const freqBin = Math.floor(lineRatio * 64);
        const audioAmp = isAudioActive ? (freqDataRef.current[freqBin] || 0) / 255.0 : 0;

        for (let j = 0; j < POINTS_PER_LINE; j++) {
          const x = array[j * 3];
          const normX = x / (LINE_WIDTH * 0.5); // -1 to 1
          const bell = Math.exp(-normX * normX * 4.0); // Bell curve peaking at center

          // Organic harmonic wave motion
          const idleWave =
            Math.sin(normX * 5.0 + elapsedTime * 1.4 + index * 0.35) * 6.5 +
            Math.cos(normX * 2.8 - elapsedTime * 0.9 + index * 0.2) * 4.0;

          // Audio reactive jump
          const audioWave = audioAmp * bell * 34.0 * (1 + Math.sin(normX * 10 + elapsedTime * 5) * 0.3);

          array[j * 3 + 1] = (idleWave + audioWave) * bell;
        }

        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      lineObjects.forEach((obj) => {
        obj.geometry.dispose();
        obj.line.material.dispose();
      });
    };
  }, []);

  return (
    <section id="waves" className="max-w-4xl mx-auto px-6 my-10">
      
      {/* 3D Wave Canvas Card */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0B0D13] shadow-2xl">
        
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-white/[0.07] bg-white/[0.02] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full transition-colors ${isPlaying ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <span className="font-mono text-slate-300 font-medium">
              {isPlaying ? 'Signal audio en cours · Fréquences actives' : 'Ondes musicales en veille'}
            </span>
          </div>
          <div className="text-slate-500 font-mono hidden sm:inline text-[11px]">
            Three.js WebGL · Analyse harmonique 3D
          </div>
        </div>

        {/* 3D WebGL Canvas Viewport */}
        <div
          ref={mountRef}
          className="w-full h-[320px] sm:h-[400px] cursor-grab active:cursor-grabbing relative"
        >
          {/* Subtle Aspect Ratio Frame Overlay showing Video Convergence */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
            <div
              className={`border border-white/15 rounded-xl transition-all duration-300 relative ${
                format === '16:9'
                  ? 'w-[85%] aspect-video max-h-[75%]'
                  : format === '9:16'
                  ? 'h-[85%] aspect-[9/16]'
                  : 'h-[75%] aspect-square'
              }`}
            >
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-500" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-500" />
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-blue-500" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-blue-500" />
              
              <div className="absolute top-2 left-2.5 font-mono text-[10px] text-slate-400">
                Cadre vidéo {format}
              </div>
            </div>
          </div>
        </div>

        {/* Minimalist Controls Bar */}
        <div className="p-4 sm:p-5 border-t border-white/[0.06] bg-[#10131A] flex flex-wrap items-center justify-between gap-4">
          
          {/* Play & Audio Presets */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={togglePlayback}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center gap-2"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Écouter'}</span>
            </button>

            <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-slate-400">
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
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">
                {customFile || 'Importer audio'}
              </span>
            </button>
          </div>

          {/* Video Format Ratio Picker & Volume */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Cadrage vidéo :</span>
              <div className="flex items-center gap-1">
                {['16:9', '9:16', '1:1'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      format === f
                        ? 'bg-white/10 text-slate-100 font-semibold border border-white/20'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-slate-400 font-mono">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="range"
                min="0"
                max="1.2"
                step="0.05"
                value={volume}
                onChange={handleVolume}
                className="w-16 accent-blue-500 cursor-pointer"
              />
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
