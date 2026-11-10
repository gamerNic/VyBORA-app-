import React, { useState } from 'react';
import { Track, ThemeColors, RepeatMode } from '../types/music';
import { audioEngine } from '../services/audioEngine';
import { AudioVisualizer } from './AudioVisualizer';
import {
  ChevronDown,
  Heart,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  Sliders,
  List,
  FileText,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';

interface PlayerViewProps {
  currentTrack: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  playbackRate: number;
  queue: Track[];
  theme: ThemeColors;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onToggleFavorite: (trackId: string) => void;
  onChangePlaybackRate: (rate: number) => void;
  onSelectFromQueue: (track: Track) => void;
  onClose: () => void;
  onOpenEqualizer: () => void;
}

export const PlayerView: React.FC<PlayerViewProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  isShuffle,
  repeatMode,
  playbackRate,
  queue,
  theme,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onToggleShuffle,
  onCycleRepeat,
  onToggleFavorite,
  onChangePlaybackRate,
  onSelectFromQueue,
  onClose,
  onOpenEqualizer,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'cover' | 'lyrics' | 'queue'>('cover');
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onSeek(val);
  };

  const rates = [0.75, 1.0, 1.25, 1.5, 2.0];
  const nextRate = () => {
    const currentIndex = rates.indexOf(playbackRate);
    const nextIdx = (currentIndex + 1) % rates.length;
    onChangePlaybackRate(rates[nextIdx]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-y-auto overflow-x-hidden pt-safe pb-safe animate-in fade-in zoom-in-95 duration-200">
      {/* Dynamic Background Glow Gradient */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 25%, ${theme.primary} 0%, transparent 70%)`,
        }}
      />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-3 pb-2 max-w-lg mx-auto w-full">
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-all active:scale-90"
          title="Minimizar reproductor"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="text-center">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
            Reproduciendo de {currentTrack.album}
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-purple-500/30 text-purple-300 bg-purple-950/40"
            >
              {currentTrack.format?.toUpperCase() || 'FLAC'} · {currentTrack.bitrate || 'Hi-Res'}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenEqualizer}
          className="p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-all active:scale-90"
          title="Abrir Ecualizador"
        >
          <Sliders className="w-5 h-5" />
        </button>
      </div>

      {/* Center Content: Album Cover, Lyrics, or Queue */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-4 max-w-lg mx-auto w-full">
        {activeSubTab === 'cover' && (
          <div className="w-full flex flex-col items-center">
            {/* Big Album Art with Electric Glow */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 group border border-white/15">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />

              {/* Luminous dynamic glow border overlay */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-500"
                style={{
                  boxShadow: `inset 0 0 25px ${theme.primary}50, 0 0 50px -10px ${theme.primary}60`,
                }}
              />
            </div>

            {/* Audio Spectrum Visualizer */}
            <div className="w-full mt-6">
              <AudioVisualizer isPlaying={isPlaying} theme={theme} />
            </div>
          </div>
        )}

        {activeSubTab === 'lyrics' && (
          <div className="w-full h-80 sm:h-96 bg-white/5 rounded-3xl p-6 border border-white/10 overflow-y-auto flex flex-col items-center text-center backdrop-blur-xl">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Letras de la Canción</span>
            </div>
            {currentTrack.lyrics && currentTrack.lyrics.length > 0 ? (
              <div className="space-y-4">
                {currentTrack.lyrics.map((line, idx) => (
                  <p
                    key={idx}
                    className={`text-base sm:text-lg transition-all ${
                      idx === 1
                        ? 'text-white font-bold text-xl scale-105'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    style={idx === 1 ? { color: theme.primary, textShadow: `0 0 16px ${theme.primary}` } : undefined}
                  >
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <FileText className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">No hay letras sincronizadas disponibles para este archivo.</p>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'queue' && (
          <div className="w-full h-80 sm:h-96 bg-white/5 rounded-3xl p-4 border border-white/10 overflow-y-auto backdrop-blur-xl">
            <h4 className="text-xs uppercase font-semibold text-slate-400 mb-3 px-2">
              Cola de Reproducción ({queue.length})
            </h4>
            <div className="space-y-1.5">
              {queue.map((track) => (
                <div
                  key={track.id}
                  onClick={() => onSelectFromQueue(track)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
                    track.id === currentTrack.id
                      ? 'bg-purple-950/60 border border-purple-500/40'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${track.id === currentTrack.id ? 'text-purple-300 font-semibold' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {formatTime(track.duration)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Switchers: Portada, Letras, Cola */}
        <div className="flex items-center gap-2 mt-4 bg-white/5 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveSubTab('cover')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              activeSubTab === 'cover' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Portada
          </button>
          <button
            onClick={() => setActiveSubTab('lyrics')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
              activeSubTab === 'lyrics' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3 h-3" /> Letras
          </button>
          <button
            onClick={() => setActiveSubTab('queue')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
              activeSubTab === 'queue' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3 h-3" /> Cola
          </button>
        </div>
      </div>

      {/* Bottom Control Section */}
      <div className="relative z-10 px-6 pb-6 max-w-lg mx-auto w-full">
        {/* Track Title, Artist & Favorite */}
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0 flex-1 mr-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white truncate tracking-tight">
              {currentTrack.title}
            </h2>
            <p className="text-sm font-medium text-slate-400 truncate mt-0.5">
              {currentTrack.artist}
            </p>
          </div>

          <button
            onClick={() => onToggleFavorite(currentTrack.id)}
            className="p-3 rounded-full bg-white/5 border border-white/10 transition-transform active:scale-125"
            title={currentTrack.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                currentTrack.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-white'
              }`}
            />
          </button>
        </div>

        {/* Scrubber Seek Bar */}
        <div className="w-full mb-4">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeekChange}
            className="w-full accent-purple-500"
            style={{
              background: `linear-gradient(to right, ${theme.primary} 0%, ${theme.primary} ${progressPercent}%, rgba(255,255,255,0.15) ${progressPercent}%, rgba(255,255,255,0.15) 100%)`,
            }}
          />
          <div className="flex justify-between text-xs font-mono text-slate-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Primary Playback Controls */}
        <div className="flex items-center justify-between mb-4 px-2">
          {/* Shuffle Toggle */}
          <button
            onClick={onToggleShuffle}
            className={`p-3 rounded-full transition-all ${
              isShuffle ? 'text-purple-400 bg-purple-500/20' : 'text-slate-400 hover:text-white'
            }`}
            title="Reproducción aleatoria"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous */}
          <button
            onClick={onPrev}
            className="p-3 rounded-full text-white hover:text-purple-300 transition-transform active:scale-90"
            title="Canción anterior"
          >
            <SkipBack className="w-7 h-7 fill-white" />
          </button>

          {/* Play / Pause Primary Button */}
          <button
            onClick={onTogglePlay}
            className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-all active:scale-95 shadow-2xl relative group"
            style={{
              backgroundColor: theme.primary,
              boxShadow: `0 0 30px ${theme.primary}80`,
            }}
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-white text-white" />
            ) : (
              <Play className="w-7 h-7 fill-white text-white ml-1" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            className="p-3 rounded-full text-white hover:text-purple-300 transition-transform active:scale-90"
            title="Siguiente canción"
          >
            <SkipForward className="w-7 h-7 fill-white" />
          </button>

          {/* Repeat Mode Cycle */}
          <button
            onClick={onCycleRepeat}
            className={`p-3 rounded-full transition-all relative ${
              repeatMode !== 'off' ? 'text-purple-400 bg-purple-500/20' : 'text-slate-400 hover:text-white'
            }`}
            title={`Modo de repetición: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5 text-purple-400" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Extra Utilities: Playback Speed and Quick Volume */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/5 pt-3">
          <button
            onClick={nextRate}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <span className="font-mono font-medium">{playbackRate}x</span>
            <span className="text-[10px] text-slate-400">Velocidad</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                audioEngine.setVolume(nextMuted ? 0 : volume);
              }}
              className="p-1.5 rounded-lg hover:text-white transition-colors"
              title={isMuted ? 'Desactivar silencio' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setVolumeState(v);
                setIsMuted(false);
                audioEngine.setVolume(v);
              }}
              className="w-20 accent-purple-500"
              title={`Volumen: ${Math.round(volume * 100)}%`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
