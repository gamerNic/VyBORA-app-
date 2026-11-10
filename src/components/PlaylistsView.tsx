import React, { useState } from 'react';
import { Playlist, Track, ThemeColors } from '../types/music';
import { Plus, Play, Trash2, ListMusic, Music, ArrowLeft, X } from 'lucide-react';

interface PlaylistsViewProps {
  playlists: Playlist[];
  tracks: Track[];
  currentTrack: Track | null;
  theme: ThemeColors;
  onPlayTrack: (track: Track) => void;
  onCreatePlaylist: (name: string, description: string, coverUrl: string) => void;
  onDeletePlaylist: (id: string) => void;
  onRemoveTrackFromPlaylist: (playlistId: string, trackId: string) => void;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  playlists,
  tracks,
  currentTrack,
  theme,
  onPlayTrack,
  onCreatePlaylist,
  onDeletePlaylist,
  onRemoveTrackFromPlaylist,
}) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedCover, setSelectedCover] = useState(tracks[0]?.coverUrl || '');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreatePlaylist(newTitle.trim(), newDesc.trim(), selectedCover);
    setNewTitle('');
    setNewDesc('');
    setIsCreating(false);
  };

  // If a playlist is selected, show detail view
  if (selectedPlaylist) {
    const playlistTracks = tracks.filter((t) => selectedPlaylist.trackIds.includes(t.id));

    return (
      <div className="pb-36 pt-4 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => setSelectedPlaylist(null)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Playlists</span>
        </button>

        {/* Playlist Hero */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 bg-white/[0.03] border border-white/5 rounded-3xl p-6">
          <div className="w-36 h-36 rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0">
            <img
              src={selectedPlaylist.coverUrl || tracks[0]?.coverUrl}
              alt={selectedPlaylist.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">
              Playlist de Sonora
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white truncate mt-1">
              {selectedPlaylist.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">{selectedPlaylist.description}</p>
            <p className="text-xs font-mono text-purple-400/80 mt-2">
              {playlistTracks.length} canciones · {Math.floor(playlistTracks.reduce((acc, t) => acc + t.duration, 0) / 60)} min
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {playlistTracks.length > 0 && (
              <button
                onClick={() => onPlayTrack(playlistTracks[0])}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white shadow-xl transition-transform active:scale-95"
                style={{
                  backgroundColor: theme.primary,
                  boxShadow: `0 0 20px ${theme.primary}60`,
                }}
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Reproducir Todo</span>
              </button>
            )}

            <button
              onClick={() => {
                if (confirm(`¿Eliminar la playlist "${selectedPlaylist.name}"?`)) {
                  onDeletePlaylist(selectedPlaylist.id);
                  setSelectedPlaylist(null);
                }
              }}
              className="p-3 rounded-2xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 transition-colors"
              title="Eliminar playlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tracks List */}
        <div className="space-y-1.5">
          {playlistTracks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white/[0.02] rounded-3xl border border-white/5">
              <Music className="w-10 h-10 mx-auto mb-2 opacity-40 text-purple-400" />
              <p className="text-sm font-semibold text-white">Esta lista está vacía</p>
              <p className="text-xs text-slate-400 mt-1">
                Ve a la Biblioteca y pulsa "+" en cualquier canción para añadirla aquí.
              </p>
            </div>
          ) : (
            playlistTracks.map((track, idx) => (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track)}
                className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer group ${
                  currentTrack?.id === track.id
                    ? 'bg-purple-950/40 border border-purple-500/40'
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
                    className="w-11 h-11 rounded-xl object-cover shrink-0"
                  />
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

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveTrackFromPlaylist(selectedPlaylist.id, track.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Quitar de esta playlist"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-36 pt-4 px-4 sm:px-6 max-w-4xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Tus Playlists</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {playlists.length} listas personalizadas
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-lg transition-transform active:scale-95"
          style={{
            backgroundColor: theme.primary,
            boxShadow: `0 0 16px ${theme.primary}50`,
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Playlist</span>
        </button>
      </div>

      {/* Grid of Playlists */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {playlists.map((pl) => (
          <div
            key={pl.id}
            onClick={() => setSelectedPlaylist(pl)}
            className="bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-purple-500/30 rounded-3xl p-3.5 cursor-pointer group transition-all duration-300 shadow-xl"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 border border-white/5">
              <img
                src={pl.coverUrl}
                alt={pl.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
              {pl.name}
            </h3>
            <p className="text-xs text-slate-400 truncate mt-0.5">{pl.description}</p>
            <span className="text-[11px] font-mono text-purple-400 mt-1 block">
              {pl.trackIds.length} canciones
            </span>
          </div>
        ))}
      </div>

      {/* Create Playlist Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-slate-950 border border-white/10 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Nueva Playlist</h3>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nombre de la lista
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Frecuencias Nocturnas"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Descripción (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Música para concentrarse o viajar"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Portada
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {tracks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedCover(t.coverUrl)}
                      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedCover === t.coverUrl
                          ? 'border-purple-500 scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={t.coverUrl}
                        alt="Cover"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 shadow-lg"
                  style={{ backgroundColor: theme.primary }}
                >
                  Crear Lista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
