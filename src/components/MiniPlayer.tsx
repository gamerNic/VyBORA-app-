import React from 'react';
import { Track, ThemeColors } from '../types/music';
import { Play, Pause, SkipForward, Heart } from 'lucide-react';

interface MiniPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onToggleFavorite: (trackId: string) => void;
  onOpenFullPlayer: () => void;
  theme: ThemeColors;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onNext,
  onToggleFavorite,
  onOpenFullPlayer,
  theme,
}) => {
  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-[65px] left-0 right-0 z-30 px-3 pb-1">
      <div
        className="max-w-lg mx-auto bg-slate-950/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-300 hover:border-white/20"
        style={{
          boxShadow: `0 8px 32px -8px ${theme.primary}25`,
        }}
      >
        {/* Top thin progress bar */}
        <div className="w-full h-1 bg-white/5 relative">
          <div
            className="h-full transition-all duration-150"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: theme.primary,
              boxShadow: `0 0 8px ${theme.primary}`,
            }}
          />
        </div>

        <div className="flex items-center justify-between p-2.5 gap-3">
          {/* Track Info (clickable to open full player) */}
          <div
            onClick={onOpenFullPlayer}
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
          >
            {/* Spinning or glowing Cover */}
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />
              {isPlaying && (
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none animate-pulse"
                  style={{
                    boxShadow: `inset 0 0 8px ${theme.primary}60`,
                  }}
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-slate-400 truncate">
                {currentTrack.artist} · <span className="text-slate-400">{currentTrack.album}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Favorite */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(currentTrack.id);
              }}
              className="p-2 rounded-full text-slate-400 hover:text-white transition-colors"
              title={currentTrack.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
              <Heart
                className={`w-5 h-5 transition-transform active:scale-125 ${
                  currentTrack.isFavorite
                    ? 'fill-rose-500 text-rose-500'
                    : 'hover:text-slate-300'
                }`}
              />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay();
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform active:scale-90 shadow-lg"
              style={{
                backgroundColor: theme.primary,
                boxShadow: `0 0 16px ${theme.primary}60`,
              }}
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white text-white" />
              ) : (
                <Play className="w-5 h-5 fill-white text-white ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="p-2 rounded-full text-slate-400 hover:text-white transition-colors active:scale-90"
              title="Siguiente canción"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
