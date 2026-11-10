import React from 'react';
import { EqualizerSettings, ThemeColors } from '../types/music';
import { EQUALIZER_PRESETS } from '../data/themes';
import { Sliders, Power, Disc3, Sparkles, Volume2 } from 'lucide-react';

interface EqualizerViewProps {
  equalizer: EqualizerSettings;
  theme: ThemeColors;
  onUpdateEqualizer: (newSettings: EqualizerSettings) => void;
}

export const EqualizerView: React.FC<EqualizerViewProps> = ({
  equalizer,
  theme,
  onUpdateEqualizer,
}) => {
  const bands = [
    { freq: 60, label: '60 Hz', role: 'Sub-Grave' },
    { freq: 230, label: '230 Hz', role: 'Graves' },
    { freq: 910, label: '910 Hz', role: 'Medios' },
    { freq: 3600, label: '3.6 kHz', role: 'Presencia' },
    { freq: 14000, label: '14 kHz', role: 'Agudos' },
  ];

  const handleBandChange = (freq: number, gain: number) => {
    onUpdateEqualizer({
      ...equalizer,
      preset: 'Personalizado',
      bands: {
        ...equalizer.bands,
        [freq]: gain,
      },
    });
  };

  const handlePresetSelect = (presetKey: string) => {
    const preset = EQUALIZER_PRESETS[presetKey];
    if (!preset) return;
    onUpdateEqualizer({
      ...equalizer,
      preset: preset.name,
      bands: { ...preset.bands },
      bassBoost: preset.bassBoost,
      virtualizer: preset.virtualizer,
    });
  };

  const togglePower = () => {
    onUpdateEqualizer({
      ...equalizer,
      enabled: !equalizer.enabled,
    });
  };

  // Generate SVG path for frequency response curve
  const curvePoints = bands.map((b, idx) => {
    const gain = equalizer.enabled ? equalizer.bands[b.freq as keyof typeof equalizer.bands] || 0 : 0;
    // Map -12 dB..12 dB to height 10..90
    const y = 50 - (gain / 12) * 35;
    const x = 30 + idx * 70;
    return `${x},${y}`;
  });
  const pathD = `M 15,50 Q ${curvePoints.join(' T ')} T 325,50`;

  return (
    <div className="pb-36 pt-4 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
      {/* Top Header & Power Toggle */}
      <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              equalizer.enabled
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white/5 text-slate-500'
            }`}
            style={
              equalizer.enabled
                ? {
                    backgroundColor: theme.primary,
                    boxShadow: `0 0 20px ${theme.primary}60`,
                  }
                : undefined
            }
          >
            <Sliders className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Ecualizador de Audio</h1>
            <p className="text-xs text-slate-400">
              Procesamiento de señal DSP de 5 bandas en tiempo real
            </p>
          </div>
        </div>

        <button
          onClick={togglePower}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
            equalizer.enabled
              ? 'bg-purple-600 text-white shadow-xl'
              : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
          }`}
          style={equalizer.enabled ? { backgroundColor: theme.primary } : undefined}
        >
          <Power className="w-4 h-4" />
          <span>{equalizer.enabled ? 'Activado' : 'Bypass'}</span>
        </button>
      </div>

      {/* Interactive Frequency Response Curve */}
      <div className="bg-slate-950/80 border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <span>CURVA DE RESPUESTA</span>
          <span className="text-purple-400 font-semibold">{equalizer.preset}</span>
        </div>

        <svg viewBox="0 0 340 100" className="w-full h-24 overflow-visible">
          {/* Grid lines */}
          <line x1="10" y1="50" x2="330" y2="50" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
          <line x1="10" y1="15" x2="330" y2="15" stroke="rgba(255,255,255,0.05)" />
          <line x1="10" y1="85" x2="330" y2="85" stroke="rgba(255,255,255,0.05)" />

          {/* Smooth Curve */}
          <path
            d={pathD}
            fill="none"
            stroke={equalizer.enabled ? theme.primary : '#475569'}
            strokeWidth="3.5"
            strokeLinecap="round"
            className="transition-all duration-300"
            style={
              equalizer.enabled
                ? { filter: `drop-shadow(0 0 8px ${theme.primary})` }
                : undefined
            }
          />

          {/* Points */}
          {bands.map((b, idx) => {
            const gain = equalizer.enabled ? equalizer.bands[b.freq as keyof typeof equalizer.bands] || 0 : 0;
            const y = 50 - (gain / 12) * 35;
            const x = 30 + idx * 70;
            return (
              <circle
                key={b.freq}
                cx={x}
                cy={y}
                r="4.5"
                fill="#ffffff"
                stroke={theme.primary}
                strokeWidth="2"
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1 px-3">
          <span>+12 dB</span>
          <span>0 dB (Flat)</span>
          <span>-12 dB</span>
        </div>
      </div>

      {/* Presets Horizontal Carousel */}
      <div>
        <h3 className="text-xs uppercase font-semibold text-slate-400 mb-2.5 px-1 tracking-wider">
          Presets Profesionales
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {Object.entries(EQUALIZER_PRESETS).map(([key, p]) => {
            const isSelected = equalizer.preset === p.name;
            return (
              <button
                key={key}
                onClick={() => handlePresetSelect(key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all active:scale-95 border ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                    : 'bg-white/5 text-slate-300 border-white/5 hover:border-white/10 hover:text-white'
                }`}
                style={isSelected ? { backgroundColor: theme.primary } : undefined}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5-Band Vertical Sliders */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
        <h3 className="text-xs uppercase font-semibold text-slate-400 mb-6 text-center tracking-wider">
          Bandas de Frecuencia
        </h3>

        <div className="grid grid-cols-5 gap-2 sm:gap-4 items-center">
          {bands.map((b) => {
            const gain = equalizer.bands[b.freq as keyof typeof equalizer.bands] || 0;
            return (
              <div key={b.freq} className="flex flex-col items-center">
                {/* dB readout */}
                <span className="text-xs font-mono font-bold text-white mb-2">
                  {gain > 0 ? `+${gain}` : gain} dB
                </span>

                {/* Vertical Slider Track Container */}
                <div className="h-44 sm:h-52 flex items-center justify-center relative py-2">
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={1}
                    value={gain}
                    disabled={!equalizer.enabled}
                    onChange={(e) => handleBandChange(b.freq, parseInt(e.target.value))}
                    className="h-36 sm:h-44 w-2 -rotate-90 origin-center accent-purple-500 cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* Labels */}
                <span className="text-xs font-mono font-bold text-purple-300 mt-2">
                  {b.label}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">{b.role}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bass Boost & 3D Virtualizer Knobs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bass Boost */}
        <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Disc3 className="w-5 h-5 text-purple-400" />
              <h4 className="text-sm font-bold text-white">Refuerzo de Bajos (Bass Boost)</h4>
            </div>
            <span className="text-xs font-mono font-bold text-purple-400">
              {equalizer.bassBoost}%
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Realza frecuencias sub-graves por debajo de 120Hz para un sonido con más pegada.
          </p>
          <input
            type="range"
            min={0}
            max={100}
            value={equalizer.bassBoost}
            disabled={!equalizer.enabled}
            onChange={(e) =>
              onUpdateEqualizer({
                ...equalizer,
                bassBoost: parseInt(e.target.value),
              })
            }
            className="w-full accent-purple-500 disabled:opacity-40"
          />
        </div>

        {/* 3D Surround Virtualizer */}
        <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">Virtualizador 3D Surround</h4>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {equalizer.virtualizer}%
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Amplía el campo estereofónico para una experiencia inmersiva espacial.
          </p>
          <input
            type="range"
            min={0}
            max={100}
            value={equalizer.virtualizer}
            disabled={!equalizer.enabled}
            onChange={(e) =>
              onUpdateEqualizer({
                ...equalizer,
                virtualizer: parseInt(e.target.value),
              })
            }
            className="w-full accent-cyan-500 disabled:opacity-40"
          />
        </div>
      </div>
    </div>
  );
};
