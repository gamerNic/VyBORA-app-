import React from 'react';
import { Track, ThemeColors } from '../types/music';
import { Play, Sparkles, Disc, Mic2, Radio, HardDrive, Sliders, Smartphone } from 'lucide-react';

interface HomeViewProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  theme: ThemeColors;
  onPlayTrack: (track: Track) => void;
  onOpenPlayer: () => void;
  onGoToLibrary: () => void;
  onImportClick: () => void;
  onOpenEqualizer?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  theme,
  onPlayTrack,
  onOpenPlayer,
  onGoToLibrary,
  onImportClick,
  onOpenEqualizer,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Group albums from real scanned tracks
  const albums = Array.from(new Set(tracks.map((t) => t.album))).map((albumName) => {
    const track = tracks.find((t) => t.album === albumName)!;
    return {
      name: albumName,
      artist: track.artist,
      coverUrl: track.coverUrl,
      tracksCount: tracks.filter((t) => t.album === albumName).length,
      sampleTrack: track,
    };
  });

  // Group artists from real scanned tracks
  const artists = Array.from(new Set(tracks.map((t) => t.artist))).map((artistName) => {
    const track = tracks.find((t) => t.artist === artistName)!;
    return {
      name: artistName,
      coverUrl: track.coverUrl,
      tracksCount: tracks.filter((t) => t.artist === artistName).length,
      sampleTrack: track,
    };
  });

  const featuredTrack = currentTrack || tracks[0];

  return (
    <div className="pb-36 pt-4 px-4 sm:px-6 max-w-4xl mx-auto space-y-7">
      {/* Top Official VyBORA Brand Banner & Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-black to-slate-950 p-4 sm:p-5 shadow-2xl">
        <div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-35 pointer-events-none"
          style={{ backgroundColor: theme.primary }}
        />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Official VyBORA Logo with neon halo */}
            <div className="relative group shrink-0">
              <div
                className="absolute -inset-1 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition duration-300"
                style={{ background: `linear-gradient(135deg, ${theme.primary}, #06b6d4)` }}
              />
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-black p-0.5 border border-white/20 shadow-lg">
                <img
                  src="/logo_vybora.png"
                  alt="VyBORA Logo Oficial"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-cyan-400 tracking-wide">
                  VyBORA
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 truncate">
                {getGreeting()} · Reproductor Musical Premium
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onImportClick}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white transition-all active:scale-95 shadow-sm"
              title="Escanear música de tu dispositivo"
            >
              <HardDrive className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Escanear</span>
            </button>
          </div>
        </div>
      </div>

      {/* When no music scanned yet */}
      {tracks.length === 0 ? (
        <div
          className="relative overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl space-y-4"
          style={{
            background: `linear-gradient(135deg, rgba(25, 12, 40, 0.9) 0%, rgba(5, 5, 12, 0.95) 100%)`,
            boxShadow: `0 12px 40px -10px ${theme.primary}30`,
          }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xl"
              style={{ backgroundColor: `${theme.primary}25`, color: theme.primary }}
            >
              <HardDrive className="w-10 h-10" />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full inline-block mb-1.5 font-semibold">
                Android MediaStore Ready
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Detección Automática de Música
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-md">
                VyBORA escanea y clasifica automáticamente toda la música almacenada en tu memoria interna y tarjeta SD con metadatos reales.
              </p>
            </div>

            <button
              onClick={onImportClick}
              className="px-6 py-3 rounded-2xl text-xs font-bold text-white shadow-xl transition-all active:scale-95 shrink-0"
              style={{
                backgroundColor: theme.primary,
                boxShadow: `0 0 25px ${theme.primary}60`,
              }}
            >
              Escanear Dispositivo
            </button>
          </div>
        </div>
      ) : (
        /* Featured "Continuar Escuchando" Hero Card with real track */
        featuredTrack && (
          <div
            className="relative overflow-hidden rounded-3xl border border-white/10 p-5 sm:p-6 transition-all duration-300 shadow-2xl group"
            style={{
              background: `linear-gradient(135deg, rgba(20, 10, 35, 0.9) 0%, rgba(5, 5, 10, 0.95) 100%)`,
              boxShadow: `0 12px 40px -10px ${theme.primary}30`,
            }}
          >
            <div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-40 pointer-events-none"
              style={{ backgroundColor: theme.primary }}
            />

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5">
              <div
                onClick={() => onPlayTrack(featuredTrack)}
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center overflow-hidden shrink-0 shadow-xl cursor-pointer group-hover:scale-105 transition-transform"
              >
                {featuredTrack.coverUrl ? (
                  <img
                    src={featuredTrack.coverUrl}
                    alt={featuredTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Disc className="w-12 h-12 text-purple-400 opacity-80" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-8 h-8 fill-white text-white drop-shadow" />
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400 bg-purple-950/60 border border-purple-500/30 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                  Reproducción Actual
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                  {featuredTrack.title}
                </h2>
                <p className="text-sm text-slate-300 truncate mt-0.5">
                  {featuredTrack.artist} · <span className="text-slate-400">{featuredTrack.album}</span>
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-xs font-mono text-slate-400">
                  <span>{featuredTrack.format?.toUpperCase()}</span>
                  <span>·</span>
                  <span>{featuredTrack.fileSize}</span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={() => onPlayTrack(featuredTrack)}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm text-white shadow-lg transition-transform active:scale-95"
                  style={{
                    backgroundColor: theme.primary,
                    boxShadow: `0 0 24px ${theme.primary}60`,
                  }}
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{currentTrack?.id === featuredTrack.id && isPlaying ? 'Pausar' : 'Escuchar'}</span>
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* Featured Albums Section (only when real albums exist) */}
      {albums.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Disc className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white tracking-tight">Álbumes Detectados</h3>
            </div>
            <button
              onClick={onGoToLibrary}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Ver todos ({albums.length})
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {albums.slice(0, 4).map((album) => (
              <div
                key={album.name}
                onClick={() => onPlayTrack(album.sampleTrack)}
                className="bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-purple-500/30 rounded-2xl p-3 transition-all duration-300 cursor-pointer group shadow-lg"
              >
                <div className="relative aspect-square rounded-xl bg-purple-950/40 border border-purple-500/20 mb-2.5 flex items-center justify-center text-purple-400 overflow-hidden shadow-md">
                  {album.coverUrl ? (
                    <img
                      src={album.coverUrl}
                      alt={album.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Disc className="w-10 h-10 opacity-70" />
                  )}
                  <button
                    className="absolute bottom-2 right-2 w-9 h-9 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </button>
                </div>

                <h4 className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                  {album.name}
                </h4>
                <p className="text-xs text-slate-400 truncate mt-0.5">{album.artist}</p>
                <span className="text-[10px] font-mono text-purple-400 mt-1 block">
                  {album.tracksCount} {album.tracksCount === 1 ? 'canción' : 'canciones'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Tracks List (only when real tracks exist) */}
      {tracks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white tracking-tight">Canciones en el Dispositivo</h3>
            </div>
            <button
              onClick={onGoToLibrary}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Ver biblioteca completa
            </button>
          </div>

          <div className="space-y-1.5">
            {tracks.slice(0, 6).map((track, idx) => (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track)}
                className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer group ${
                  currentTrack?.id === track.id
                    ? 'bg-purple-950/40 border border-purple-500/40'
                    : 'bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-white/5'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-slate-400 w-4 text-center">
                    {idx + 1}
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 overflow-hidden">
                    {track.coverUrl ? (
                      <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <Disc className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4
                      className={`text-sm font-semibold truncate ${
                        currentTrack?.id === track.id ? 'text-purple-300' : 'text-white'
                      }`}
                    >
                      {track.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-slate-400">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </span>
                  <button
                    className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-purple-600 flex items-center justify-center text-slate-300 group-hover:text-white transition-all"
                    title="Reproducir"
                  >
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real Artists List */}
      {artists.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3.5">
            <Mic2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">Artistas de tu Colección</h3>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
            {artists.map((artist) => (
              <div
                key={artist.name}
                onClick={() => onPlayTrack(artist.sampleTrack)}
                className="flex flex-col items-center shrink-0 w-24 cursor-pointer group"
              >
                <div className="w-20 h-20 rounded-full bg-purple-950/40 flex items-center justify-center text-purple-400 border-2 border-purple-500/30 group-hover:border-purple-400 transition-all p-0.5 shadow-lg group-hover:scale-105">
                  {artist.coverUrl ? (
                    <img
                      src={artist.coverUrl}
                      alt={artist.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <Mic2 className="w-8 h-8" />
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-200 group-hover:text-purple-300 text-center truncate w-full mt-2">
                  {artist.name}
                </p>
                <span className="text-[10px] text-slate-400">
                  {artist.tracksCount} {artist.tracksCount === 1 ? 'canción' : 'canciones'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
