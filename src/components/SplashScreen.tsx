import React, { useEffect, useState } from 'react';
import { ThemeColors } from '../types/music';

interface SplashScreenProps {
  theme: ThemeColors;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ theme, onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Iniciando VyBORA...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const steps = [
      { p: 25, text: 'Cargando motor de audio...' },
      { p: 55, text: 'Inicializando ecualizador de 5 bandas...' },
      { p: 85, text: 'Sincronizando almacenamiento del dispositivo...' },
      { p: 100, text: 'Listo para reproducir' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].p);
        setStatusText(steps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(onFinish, 400);
        }, 300);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div
      onClick={() => {
        setIsFadingOut(true);
        setTimeout(onFinish, 200);
      }}
      className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 select-none transition-opacity duration-400 cursor-pointer ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#000000' }}
    >
      {/* Ambient Neon Radial Halo */}
      <div
        className="absolute w-[360px] h-[360px] rounded-full blur-[110px] opacity-40 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${theme.primary} 0%, rgba(6, 182, 212, 0.25) 60%, transparent 100%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full space-y-6">
        {/* Official VyBORA Logo with glowing border */}
        <div className="relative group">
          <div
            className="absolute -inset-2 rounded-[32px] blur-xl opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, #06b6d4, #ec4899)`,
            }}
          />
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-[28px] overflow-hidden bg-black p-1 shadow-2xl border border-white/10">
            <img
              src="/logo_vybora.png"
              alt="VyBORA Logo Oficial"
              className="w-full h-full object-cover rounded-[24px]"
            />
          </div>
        </div>

        {/* Branding Typography */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-cyan-400">
              VyBORA
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
              PRO
            </span>
          </div>
          <p className="text-xs text-slate-400 tracking-wide">
            Reproductor Musical Premium para Android
          </p>
        </div>

        {/* Equalizer animation bar */}
        <div className="flex items-center justify-center gap-1.5 h-6">
          {[40, 75, 100, 60, 90, 45, 80, 50, 95, 65].map((height, i) => (
            <div
              key={i}
              className="w-1 rounded-full animate-pulse"
              style={{
                height: `${height}%`,
                backgroundColor: i % 2 === 0 ? theme.primary : '#06b6d4',
                animationDelay: `${i * 90}ms`,
                animationDuration: '700ms',
              }}
            />
          ))}
        </div>

        {/* Progress Bar & Status Text */}
        <div className="w-full max-w-[240px] space-y-2">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${theme.primary}, #06b6d4)`,
                boxShadow: `0 0 10px ${theme.primary}`,
              }}
            />
          </div>
          <p className="text-[11px] font-mono text-slate-400 truncate">
            {statusText}
          </p>
        </div>

        <p className="text-[10px] text-slate-400 pt-4">
          Toca cualquier parte para continuar
        </p>
      </div>
    </div>
  );
};
