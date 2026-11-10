import React, { useState, useEffect } from 'react';
import { ThemePreset, ThemeColors } from '../types/music';
import { THEMES } from '../data/themes';
import {
  Moon,
  Clock,
  Palette,
  Smartphone,
  Sliders,
  Code,
  ShieldCheck,
  Check,
  Volume2,
  Download,
  Sparkles,
} from 'lucide-react';

interface SettingsViewProps {
  currentTheme: ThemePreset;
  theme: ThemeColors;
  isPhoneFrame: boolean;
  onThemeChange: (theme: ThemePreset) => void;
  onTogglePhoneFrame: () => void;
  onOpenAndroidCode: () => void;
  onSetSleepTimer: (minutes: number) => void;
  onCancelSleepTimer: () => void;
  sleepTimerEnd: number | null;
  onOpenWelcome?: () => void;
  onOpenSplash?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentTheme,
  theme,
  isPhoneFrame,
  onThemeChange,
  onTogglePhoneFrame,
  onOpenAndroidCode,
  onSetSleepTimer,
  onCancelSleepTimer,
  sleepTimerEnd,
  onOpenWelcome,
  onOpenSplash,
}) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [customMinutes, setCustomMinutes] = useState('');
  const [crossfade, setCrossfade] = useState(2);
  const [normalizeVolume, setNormalizeVolume] = useState(true);

  // Countdown effect
  useEffect(() => {
    if (!sleepTimerEnd) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((sleepTimerEnd - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerEnd]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const timerPresets = [15, 30, 45, 60];

  return (
    <div className="pb-36 pt-4 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Configuración</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Personalización, temporizador de sueño y exportación nativa para Android.
        </p>
      </div>

      {/* Android Native Studio Banner CTA */}
      <div
        className="relative overflow-hidden rounded-3xl border border-white/10 p-5 sm:p-6 shadow-2xl transition-all"
        style={{
          background: `linear-gradient(135deg, rgba(20, 15, 45, 0.9) 0%, rgba(5, 5, 12, 0.95) 100%)`,
          boxShadow: `0 12px 35px -10px ${theme.primary}30`,
        }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg"
              style={{ backgroundColor: theme.primary }}
            >
              <Code className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">APK Lista & Proyecto Android Nativo</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                  APK Móvil Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Instalación directa en teléfono, compilación automática en la nube y código fuente completo para Android Studio.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAndroidCode}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl text-xs font-bold text-white shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2"
            style={{ backgroundColor: theme.primary }}
          >
            <span>Obtener APK e Instalar</span>
          </button>
        </div>
      </div>

      {/* 1. Theme Selector */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Palette className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Temas y Acentos Luminosos</h3>
            <p className="text-xs text-slate-400">
              Personaliza el color de realce y el halo de iluminación AMOLED.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {Object.entries(THEMES).map(([key, t]) => {
            const isSelected = currentTheme === key;
            return (
              <button
                key={key}
                onClick={() => onThemeChange(key as ThemePreset)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500/60 shadow-lg'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full shadow-md flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`,
                      boxShadow: `0 0 12px ${t.primary}80`,
                    }}
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-white">{t.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Fondo Negro AMOLED
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: t.primary }}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Sleep Timer */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Temporizador de Apagado (Sleep Timer)</h3>
              <p className="text-xs text-slate-400">
                Detén la música automáticamente cuando te vayas a dormir.
              </p>
            </div>
          </div>

          {timeLeft !== null && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-purple-400 bg-purple-950/60 border border-purple-500/40 px-3 py-1 rounded-xl">
                {formatTimer(timeLeft)}
              </span>
              <button
                onClick={onCancelSleepTimer}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium underline"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {timerPresets.map((mins) => (
            <button
              key={mins}
              onClick={() => onSetSleepTimer(mins)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-purple-600/30 border border-white/5 hover:border-purple-500/40 text-slate-200 hover:text-white transition-all active:scale-95"
            >
              {mins} minutos
            </button>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Minutos"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              className="w-20 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            {customMinutes && (
              <button
                onClick={() => {
                  const m = parseInt(customMinutes);
                  if (m > 0) onSetSleepTimer(m);
                  setCustomMinutes('');
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white"
                style={{ backgroundColor: theme.primary }}
              >
                Fijar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Smartphone Frame Simulator */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Marco de Teléfono Android</h3>
              <p className="text-xs text-slate-400">
                Simula la apariencia física de un smartphone Android de gama alta con notch y biseles curvos.
              </p>
            </div>
          </div>

          <button
            onClick={onTogglePhoneFrame}
            className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
              isPhoneFrame ? 'bg-purple-600' : 'bg-slate-700'
            }`}
            style={isPhoneFrame ? { backgroundColor: theme.primary } : undefined}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isPhoneFrame ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 4. Audio Quality & Playback Preferences */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Volume2 className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Motor de Reproducción y Calidad</h3>
            <p className="text-xs text-slate-400">
              Ajustes de procesamiento y transición de audio.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {/* Crossfade */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-white">Fundido Cruzado (Crossfade)</h4>
              <p className="text-[11px] text-slate-400">
                Transición suave entre pistas sin silencios abruptos.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-purple-400">{crossfade}s</span>
              <input
                type="range"
                min={0}
                max={8}
                value={crossfade}
                onChange={(e) => setCrossfade(parseInt(e.target.value))}
                className="w-24 accent-purple-500"
              />
            </div>
          </div>

          {/* Volume Normalization */}
          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <div>
              <h4 className="text-xs font-semibold text-white">Normalización de Volumen ReplayGain</h4>
              <p className="text-[11px] text-slate-400">
                Mantiene un nivel de sonoridad uniforme en todas las canciones.
              </p>
            </div>
            <button
              onClick={() => setNormalizeVolume(!normalizeVolume)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                normalizeVolume ? 'bg-purple-600' : 'bg-slate-700'
              }`}
              style={normalizeVolume ? { backgroundColor: theme.primary } : undefined}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  normalizeVolume ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Acerca de VyBORA */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Acerca de VyBORA</h3>
            <p className="text-xs text-slate-400">
              Información oficial de la aplicación y autoría.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-2xl bg-black/40 border border-white/5">
          {/* Official Logo with neon glow */}
          <div className="relative group shrink-0">
            <div
              className="absolute -inset-1 rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition duration-300"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, #06b6d4, #a855f7)`,
              }}
            />
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-black p-0.5 border border-white/20 shadow-xl">
              <img
                src="/logo_vybora.png"
                alt="VyBORA Logo Oficial"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h4 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-cyan-400">
                VyBORA
              </h4>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Versión 1.0
              </span>
            </div>

            <div className="text-xs text-slate-300 space-y-1 font-mono pt-1">
              <p className="text-slate-400 text-[11px]">
                Reproductor de Audio Premium AMOLED para Android
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                <span>Versión 1.0 · Desarrollado por </span>
                <strong className="text-purple-300 font-semibold">Kenier Bravo</strong>
                <span> · © 2026</span>
              </p>
            </div>
          </div>
        </div>

        {/* Preview Screens Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          {onOpenWelcome && (
            <button
              onClick={onOpenWelcome}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Ver Pantalla de Bienvenida</span>
            </button>
          )}

          {onOpenSplash && (
            <button
              onClick={onOpenSplash}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors"
            >
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ver Pantalla de Carga (Splash)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
