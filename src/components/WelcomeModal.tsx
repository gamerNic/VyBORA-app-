import React from 'react';
import { ThemeColors } from '../types/music';
import { Play, Sparkles, HardDrive, Sliders, ShieldCheck, X, Music, CheckCircle2 } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeColors;
  onScanClick: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  theme,
  onScanClick,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-purple-500/30 rounded-3xl max-w-lg w-full flex flex-col shadow-[0_0_60px_rgba(168,85,247,0.3)] overflow-hidden relative">
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 -left-24 w-60 h-60 rounded-full blur-[90px] opacity-40 pointer-events-none"
          style={{ backgroundColor: theme.primary }}
        />
        <div
          className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-[90px] opacity-30 pointer-events-none"
          style={{ backgroundColor: '#06b6d4' }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Cerrar bienvenida"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6 relative z-10 text-center flex flex-col items-center">
          {/* Official VyBORA Logo with neon rim */}
          <div className="relative group">
            <div
              className="absolute -inset-2 rounded-[30px] blur-xl opacity-80 group-hover:opacity-100 transition duration-500"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, #06b6d4, #a855f7)`,
              }}
            />
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[24px] overflow-hidden bg-black p-1 shadow-2xl border border-white/20">
              <img
                src="/logo_vybora.png"
                alt="VyBORA Logo Oficial"
                className="w-full h-full object-cover rounded-[20px]"
              />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-purple-400 font-bold">
              Bienvenido a
            </span>
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-cyan-400 tracking-wide">
              VyBORA
            </h2>
            <p className="text-xs text-slate-300 max-w-sm mx-auto pt-1">
              El reproductor musical moderno, premium y profesional diseñado para audiófilos y dispositivos Android.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="w-full space-y-2.5 text-left bg-white/[0.03] border border-white/5 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Reproducción de Alta Fidelidad</h4>
                <p className="text-[11px] text-slate-400">
                  Compatible con MP3, WAV, FLAC, M4A, OGG, AAC y Opus con motor nativo real.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Escaneo Automático de Dispositivo</h4>
                <p className="text-[11px] text-slate-400">
                  Detección de música en almacenamiento interno y tarjetas SD sin canciones ficticias.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Ecualizador Gráfico Profesional</h4>
                <p className="text-[11px] text-slate-400">
                  5 bandas de frecuencia, Bass Boost profundo y virtualizador envolvente.
                </p>
              </div>
            </div>
          </div>

          {/* Creator Credits Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300 font-mono">
            <span>Creador: <strong className="text-white">Kenier Bravo</strong></span>
            <span>·</span>
            <span>Versión: <strong className="text-purple-400">1.0</strong></span>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                onScanClick();
              }}
              className="flex-1 py-3 px-4 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl"
              style={{
                backgroundColor: theme.primary,
                boxShadow: `0 0 25px ${theme.primary}50`,
              }}
            >
              <HardDrive className="w-4 h-4" />
              <span>Escanear mi Música</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              Comenzar a Escuchar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
