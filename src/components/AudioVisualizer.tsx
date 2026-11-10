import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../services/audioEngine';
import { ThemeColors } from '../types/music';
import { Activity, BarChart2, Radio, Sparkles } from 'lucide-react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  theme: ThemeColors;
  className?: string;
}

interface PeakParticle {
  x: number;
  y: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  theme,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visualMode, setVisualMode] = useState<'fluid' | 'bars' | 'halo'>('fluid');

  // Peak caps memory for bars mode
  const peakCapsRef = useRef<number[]>([]);
  // Floating neon particles for fluid mode
  const particlesRef = useRef<PeakParticle[]>([]);
  // Smooth interpolated frequency buffer
  const smoothedFreqsRef = useRef<number[]>(new Array(64).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    // Adjust canvas resolution for crisp display on high-DPI screens
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Clear with true AMOLED black transparent clear
      ctx.clearRect(0, 0, width, height);

      // Fetch real FFT frequency byte data from AudioEngine Web Audio Analyser
      const rawData = audioEngine.getFrequencyData();
      const hasRealAudio = isPlaying && rawData.some((v) => v > 0);

      // Smooth interpolation filter
      const sampleCount = 48;
      const smoothed = smoothedFreqsRef.current;
      for (let i = 0; i < sampleCount; i++) {
        const rawIdx = Math.floor((i / sampleCount) * Math.min(rawData.length, 64));
        let targetVal = 0;

        if (hasRealAudio) {
          targetVal = rawData[rawIdx];
        } else if (isPlaying) {
          // Graceful organic ambient wave if Web Audio is warming up
          const wave1 = Math.sin(time / 280 + i * 0.28) * 35;
          const wave2 = Math.cos(time / 450 + i * 0.15) * 20;
          targetVal = Math.max(8, 30 + wave1 + wave2);
        } else {
          // Gentle resting pulse when paused
          targetVal = Math.max(3, 8 + Math.sin(time / 600 + i * 0.2) * 5);
        }

        // Low-pass exponential smoothing
        smoothed[i] += (targetVal - smoothed[i]) * 0.22;
      }

      /* -------------------------------------------------------------
       * MODE 1: FLUID NEON FREQUENCY SPECTRUM (Curved mountain & glow)
       * ------------------------------------------------------------- */
      if (visualMode === 'fluid') {
        const points: { x: number; y: number }[] = [];
        const sliceWidth = width / (sampleCount - 1);

        for (let i = 0; i < sampleCount; i++) {
          const val = smoothed[i];
          const normalized = val / 255;
          // Curve height response: quadratic emphasis on bass and mid frequencies
          const y = height - (Math.pow(normalized, 1.15) * (height * 0.88) + 4);
          points.push({ x: i * sliceWidth, y });

          // Spawn glowing floating particles at high transients
          if (isPlaying && val > 140 && Math.random() < 0.25) {
            particlesRef.current.push({
              x: i * sliceWidth + (Math.random() - 0.5) * 6,
              y: y,
              vy: -(Math.random() * 40 + 20),
              alpha: 0.95,
              size: Math.random() * 2.5 + 1.2,
              color: i % 2 === 0 ? theme.primary : '#06b6d4',
            });
          }
        }

        // 1. Draw glowing gradient fill under curve
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(points[0].x, points[0].y);

        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const xc = (p0.x + p1.x) / 2;
          const yc = (p0.y + p1.y) / 2;
          ctx.quadraticCurveTo(p0.x, p0.y, xc, yc);
        }
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.lineTo(width, height);
        ctx.closePath();

        const areaGradient = ctx.createLinearGradient(0, 0, 0, height);
        areaGradient.addColorStop(0, `${theme.primary}55`);
        areaGradient.addColorStop(0.5, `${theme.secondary}25`);
        areaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = areaGradient;
        ctx.fill();
        ctx.restore();

        // 2. Outer soft neon halo line
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const xc = (p0.x + p1.x) / 2;
          const yc = (p0.y + p1.y) / 2;
          ctx.quadraticCurveTo(p0.x, p0.y, xc, yc);
        }
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);

        ctx.shadowColor = theme.primary;
        ctx.shadowBlur = 18;
        ctx.strokeStyle = theme.primary;
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 3. Sharp luminous core stroke
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#06b6d4';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.restore();

        // 4. Update and render floating neon particles
        const particles = particlesRef.current;
        for (let p = particles.length - 1; p >= 0; p--) {
          const pt = particles[p];
          pt.y += pt.vy * dt;
          pt.alpha -= dt * 1.4;

          if (pt.alpha <= 0 || pt.y < 0) {
            particles.splice(p, 1);
            continue;
          }

          ctx.save();
          ctx.shadowColor = pt.color;
          ctx.shadowBlur = 8;
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = pt.alpha;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      /* -------------------------------------------------------------
       * MODE 2: BARRAS NEÓN AMOLED (Rounded bars with peak hold)
       * ------------------------------------------------------------- */
      else if (visualMode === 'bars') {
        const barCount = 38;
        const totalGap = width * 0.28;
        const barWidth = (width - totalGap) / barCount;
        const gap = totalGap / (barCount - 1);

        if (peakCapsRef.current.length !== barCount) {
          peakCapsRef.current = new Array(barCount).fill(0);
        }
        const peakCaps = peakCapsRef.current;

        for (let i = 0; i < barCount; i++) {
          const val = smoothed[Math.floor((i / barCount) * sampleCount)];
          const normalized = val / 255;
          const barHeight = Math.max(3, normalized * (height * 0.85));
          const x = i * (barWidth + gap);
          const y = height - barHeight;

          // Peak cap gravity
          if (barHeight > peakCaps[i]) {
            peakCaps[i] = barHeight;
          } else {
            peakCaps[i] = Math.max(0, peakCaps[i] - dt * 55);
          }

          // Luminous neon bar
          ctx.save();
          const barGradient = ctx.createLinearGradient(0, height, 0, y);
          barGradient.addColorStop(0, `${theme.secondary}90`);
          barGradient.addColorStop(0.6, theme.primary);
          barGradient.addColorStop(1, '#06b6d4');

          ctx.shadowColor = theme.primary;
          ctx.shadowBlur = isPlaying ? 10 : 3;
          ctx.fillStyle = barGradient;

          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [barWidth / 2, barWidth / 2, 2, 2]);
          ctx.fill();

          // Floating peak cap with bright glow
          const capY = height - peakCaps[i] - 3;
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(x, capY, barWidth, 2, [1, 1, 1, 1]);
          ctx.fill();
          ctx.restore();
        }
      }

      /* -------------------------------------------------------------
       * MODE 3: HALO RADIAL NEÓN (Pulsating circular soundwave)
       * ------------------------------------------------------------- */
      else {
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = Math.min(width, height) * 0.32;

        ctx.save();
        ctx.translate(centerX, centerY);

        const segments = 44;
        const outerPoints: { x: number; y: number }[] = [];

        for (let i = 0; i < segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          const val = smoothed[i % sampleCount];
          const r = baseRadius + (val / 255) * (baseRadius * 0.65);
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          outerPoints.push({ x: px, y: py });
        }

        // Inner glowing core
        ctx.shadowColor = theme.primary;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = theme.primary;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(outerPoints[0].x, outerPoints[0].y);
        for (let i = 0; i < outerPoints.length; i++) {
          const next = outerPoints[(i + 1) % outerPoints.length];
          const xc = (outerPoints[i].x + next.x) / 2;
          const yc = (outerPoints[i].y + next.y) / 2;
          ctx.quadraticCurveTo(outerPoints[i].x, outerPoints[i].y, xc, yc);
        }
        ctx.closePath();
        ctx.stroke();

        // Pulsating center emblem
        const bassVal = smoothed[2] / 255;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 16;
        ctx.fillStyle = `${theme.primary}30`;
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius * 0.45 + bassVal * 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying, visualMode, theme]);

  return (
    <div className={`relative flex flex-col items-center w-full ${className}`}>
      {/* Dynamic Spectrum Canvas */}
      <div className="relative w-full h-20 sm:h-24 rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 p-1 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />
        {/* Soft neon floor reflection */}
        <div
          className="absolute bottom-0 inset-x-0 h-1 blur-sm opacity-50 pointer-events-none"
          style={{ backgroundColor: theme.primary }}
        />
      </div>

      {/* Visualizer Mode Switcher */}
      <div className="flex items-center gap-1.5 mt-2 bg-black/60 border border-white/5 p-1 rounded-full backdrop-blur-md">
        <button
          onClick={() => setVisualMode('fluid')}
          title="Espectro Neón Fluido"
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
            visualMode === 'fluid'
              ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
          style={visualMode === 'fluid' ? { boxShadow: `0 0 14px ${theme.primary}60` } : undefined}
        >
          <Activity className="w-3.5 h-3.5 text-cyan-300" />
          <span>Espectro Fluido</span>
        </button>

        <button
          onClick={() => setVisualMode('bars')}
          title="Barras de Frecuencia"
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
            visualMode === 'bars'
              ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
          style={visualMode === 'bars' ? { boxShadow: `0 0 14px ${theme.primary}60` } : undefined}
        >
          <BarChart2 className="w-3.5 h-3.5 text-purple-300" />
          <span>Barras Neón</span>
        </button>

        <button
          onClick={() => setVisualMode('halo')}
          title="Halo Radial"
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
            visualMode === 'halo'
              ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
          style={visualMode === 'halo' ? { boxShadow: `0 0 14px ${theme.primary}60` } : undefined}
        >
          <Radio className="w-3.5 h-3.5 text-fuchsia-300" />
          <span>Halo</span>
        </button>
      </div>
    </div>
  );
};
