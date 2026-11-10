import React from 'react';
import { Track, ThemeColors } from '../types/music';
import { Heart, Play, Shuffle, Music, Sparkles } from 'lucide-react';

interface FavoritesViewProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  theme: ThemeColors;
  onPlayTrack: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
  onShuffleAllFavorites: () => void;
  onGoToLibrary: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  theme,
  onPlayTrack,
  onToggleFavorite,
  onShuffleAllFavorites,
  onGoToLibrary,
}) => {
  const favoriteTracks = tracks.filter((t) => t.isFavorite);
  const totalDuration = favoriteTracks.reduce((acc, t) => acc + t.duration, 0);

  return (
    <div className="pb-36 pt-4 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
      {/* Hero Header */}
      <div
        className="relative overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-7 shadow-2xl transition-all"
        style={{
          background: `linear-gradient(135deg, rgba(35, 10, 25, 0.9) 0%, rgba(5, 5, 10, 0.95) 100%)`,
          boxShadow: `0 12px 40px -10px rgba(244, 63, 94, 0.25)`,
        }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-rose-600/30 shrink-0">
            <Heart className="w-12 h-12 fill-white drop-shadow" />
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-rose-400 uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Colección Personal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white truncate">
              Tus Favoritos
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Canciones que has marcado con el corazón para acceso instantáneo.
            </p>
            <p className="text-xs font-mono text-rose-300/80 mt-2">
              {favoriteTracks.length} canciones guardadas · {Math.floor(totalDuration / 60)} min
            </p>
          </div>

          {favoriteTracks.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onShuffleAllFavorites}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white shadow-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 transition-transform active:scale-95"
              >
                <Shuffle className="w-4 h-4" />
                <span>Aleatorio</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Track List */}
      <div className="space-y-1.5">
        {favoriteTracks.length === 0 ? (
          <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-white/5 space-y-3">
            <Heart className="w-12 h-12 mx-auto text-slate-600" />
            <h3 className="text-lg font-bold text-white">Aún no tienes favoritos</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Toca el icono del corazón en cualquier canción del reproductor o la biblioteca para guardarla aquí.
            </p>
            <button
              onClick={onGoToLibrary}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-purple-400 border border-white/10 transition-colors"
            >
              Explorar Biblioteca
            </button>
          </div>
        ) : (
          favoriteTracks.map((track, idx) => (
            <div
              key={track.id}
              onClick={() => onPlayTrack(track)}
              className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer group ${
                currentTrack?.id === track.id
                  ? 'bg-purple-950/40 border border-purple-500/40 shadow-lg'
                  : 'bg-white/[0.02] hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono text-slate-400 w-4 text-center">
                  {idx + 1}
                </span>
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-xl object-cover shrink-0 border border-white/5"
                />
                <div className="min-w-0">
                  <h4
                    className={`text-sm font-semibold truncate ${
                      currentTrack?.id === track.id ? 'text-purple-300' : 'text-white'
                    }`}
                  >
                    {track.title}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    {track.artist} · <span className="text-slate-400">{track.album}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(track.id);
                  }}
                  className="p-2 text-rose-500 hover:text-slate-400 transition-colors"
                  title="Quitar de favoritos"
                >
                  <Heart className="w-5 h-5 fill-rose-500" />
                </button>

                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                </span>

                <button
                  className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-purple-600 flex items-center justify-center text-slate-300 group-hover:text-white transition-all ml-1"
                >
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
