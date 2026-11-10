import React, { useState, useRef } from 'react';
import { Track, ThemeColors, Playlist } from '../types/music';
import {
  Search,
  FolderOpen,
  Music,
  Disc,
  Mic2,
  Folder,
  Play,
  Heart,
  Plus,
  ArrowUpDown,
  Trash2,
  RefreshCw,
  HardDrive,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';

interface LibraryViewProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  playlists: Playlist[];
  theme: ThemeColors;
  onPlayTrack: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
  onImportTracks: (newTracks: Track[]) => void;
  onDeleteCustomTrack: (trackId: string) => void;
  onAddTrackToPlaylist: (playlistId: string, trackId: string) => void;
  onOpenAndroidCode?: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  playlists,
  theme,
  onPlayTrack,
  onToggleFavorite,
  onImportTracks,
  onDeleteCustomTrack,
  onAddTrackToPlaylist,
  onOpenAndroidCode,
}) => {
  const [subTab, setSubTab] = useState<'tracks' | 'albums' | 'artists' | 'folders'>('tracks');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'duration' | 'date'>('title');
  const [playlistMenuTrackId, setPlaylistMenuTrackId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  // Filter tracks in real-time by title, artist, or album
  const filteredTracks = tracks.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.album.toLowerCase().includes(q)
    );
  });

  // Sort tracks
  const sortedTracks = [...filteredTracks].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
    if (sortBy === 'duration') return b.duration - a.duration;
    return 0;
  });

  // Process and deduplicate scanned audio files
  const processFiles = async (fileList: FileList | File[]) => {
    setIsScanning(true);
    try {
      const { saveAudioFile } = await import('../services/db');
      const importedList: Track[] = [];
      const existingKeys = new Set(
        tracks.map((t) => `${t.title.toLowerCase()}_${t.artist.toLowerCase()}_${t.fileSize}`)
      );

      const files = Array.from(fileList);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';

        // Filter only valid audio extensions
        if (!['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac', 'opus', 'webm', 'wma'].includes(ext)) {
          continue;
        }

        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/^[0-9]+[\s._-]+/, '');

        let artist = 'Audio Local';
        let title = cleanName;
        if (cleanName.includes(' - ')) {
          const parts = cleanName.split(' - ');
          artist = parts[0].trim();
          title = parts.slice(1).join(' - ').trim();
        }

        // Check for duplicates
        const dedupeKey = `${title.toLowerCase()}_${artist.toLowerCase()}_${sizeMb} MB`;
        if (existingKeys.has(dedupeKey)) {
          continue;
        }
        existingKeys.add(dedupeKey);

        const trackId = `track-${Date.now()}-${i}`;
        const blobUrl = URL.createObjectURL(file);

        // Extract folder name
        const relativePath = (file as any).webkitRelativePath || '';
        let folderName = 'Música';
        if (relativePath) {
          const pathSegments = relativePath.split('/');
          folderName = pathSegments.length > 1 ? pathSegments[pathSegments.length - 2] : pathSegments[0];
        }

        // Persist binary into IndexedDB
        await saveAudioFile(trackId, file);

        importedList.push({
          id: trackId,
          title,
          artist,
          album: folderName,
          duration: 180, // Updated dynamically on first play or probe
          src: blobUrl,
          coverUrl: '',
          isFavorite: false,
          format: ext as any,
          bitrate: `${ext.toUpperCase()}`,
          fileSize: `${sizeMb} MB`,
          isCustomFile: true,
        });
      }

      if (importedList.length > 0) {
        onImportTracks(importedList);
      }
    } catch (err) {
      console.error('Error processing audio files:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    e.target.value = '';
  };

  // Modern File System Directory Picker or fallback
  const triggerFolderScan = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        setIsScanning(true);
        const dirHandle = await (window as any).showDirectoryPicker();
        const files: File[] = [];

        async function scanDir(handle: any) {
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') {
              const file = await entry.getFile();
              files.push(file);
            } else if (entry.kind === 'directory') {
              await scanDir(entry);
            }
          }
        }

        await scanDir(dirHandle);
        await processFiles(files);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // Fallback to traditional input
          folderInputRef.current?.click();
        }
      } finally {
        setIsScanning(false);
      }
    } else {
      folderInputRef.current?.click();
    }
  };

  // Group by albums based on filtered tracks
  const albumGroups = Array.from(new Set(filteredTracks.map((t) => t.album))).map((albumName) => {
    const albumTracks = filteredTracks.filter((t) => t.album === albumName);
    return {
      name: albumName,
      artist: albumTracks[0]?.artist || 'Varios Artistas',
      coverUrl: albumTracks[0]?.coverUrl || '',
      count: albumTracks.length,
      tracks: albumTracks,
    };
  });

  // Group by artists based on filtered tracks
  const artistGroups = Array.from(new Set(filteredTracks.map((t) => t.artist))).map((artistName) => {
    const artistTracks = filteredTracks.filter((t) => t.artist === artistName);
    return {
      name: artistName,
      coverUrl: artistTracks[0]?.coverUrl || '',
      count: artistTracks.length,
      tracks: artistTracks,
    };
  });

  // Group by folders based on filtered tracks
  const folderGroups = Array.from(new Set(filteredTracks.map((t) => t.album))).map((folderName) => {
    const folderTracks = filteredTracks.filter((t) => t.album === folderName);
    return {
      name: folderName,
      count: folderTracks.length,
      tracks: folderTracks,
    };
  });

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
          processFiles(e.dataTransfer.files);
        }
      }}
      className="pb-36 pt-4 px-4 sm:px-6 max-w-4xl mx-auto space-y-5"
    >
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilesSelected}
        multiple
        accept="audio/*,audio/mp3,audio/wav,audio/flac,audio/ogg,audio/aac,audio/m4a,audio/x-m4a,.mp3,.wav,.flac,.ogg,.m4a,.aac,.opus,.webm"
        className="hidden"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFilesSelected}
        {...({ webkitdirectory: '', directory: '' } as any)}
        className="hidden"
      />

      {/* Header & Android MediaStore Detection Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 uppercase tracking-widest">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Almacenamiento del Dispositivo</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
            Biblioteca Musical
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {tracks.length} {tracks.length === 1 ? 'canción detectada' : 'canciones detectadas'} · Memoria Interna y Tarjeta SD
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerFolderScan}
            disabled={isScanning}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-white transition-all active:scale-95 shadow-lg"
            style={{
              backgroundColor: theme.primary,
              boxShadow: `0 0 20px ${theme.primary}50`,
            }}
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Escaneando...' : 'Escanear Música'}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-transform active:scale-95"
            title="Añadir archivos específicos"
          >
            <FolderOpen className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Archivos</span>
          </button>
        </div>
      </div>

      {/* Top Real-Time Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar canciones por título o artista en tiempo real..."
          className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 shadow-inner transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            title="Limpiar búsqueda"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Android MediaStore Native Info Banner */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-slate-300 truncate text-[11px]">
            <span className="font-semibold text-white">Android 13+ READ_MEDIA_AUDIO</span> · Escaneo automático de MediaStore activo en memoria interna y SD.
          </p>
        </div>

        {onOpenAndroidCode && (
          <button
            onClick={onOpenAndroidCode}
            className="text-[11px] font-mono text-purple-400 hover:text-purple-300 whitespace-nowrap ml-2 underline"
          >
            Ver Kotlin
          </button>
        )}
      </div>

      {/* Empty State when no music has been scanned yet */}
      {tracks.length === 0 && (
        <div className="p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-4 shadow-2xl">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl"
            style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
          >
            <Music className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">Sin canciones detectadas</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Sonora lee directamente tus archivos de música reales (MP3, WAV, FLAC, OGG, AAC) desde tu almacenamiento sin datos ficticios.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={triggerFolderScan}
              disabled={isScanning}
              className="px-6 py-3 rounded-2xl text-xs font-bold text-white shadow-xl transition-all active:scale-95 inline-flex items-center gap-2"
              style={{
                backgroundColor: theme.primary,
                boxShadow: `0 0 25px ${theme.primary}60`,
              }}
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Escaneando archivos...' : 'Escanear Carpeta de Música'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            También puedes arrastrar y soltar archivos o carpetas directamente aquí.
          </p>
        </div>
      )}

      {/* Subtabs and Lists (when tracks exist) */}
      {tracks.length > 0 && (
        <>
          {searchQuery && (
            <div className="flex items-center justify-between px-1 text-xs text-slate-400">
              <span>
                Mostrando <strong className="text-purple-300">{sortedTracks.length}</strong> de {tracks.length} canciones para &ldquo;{searchQuery}&rdquo;
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-purple-400 hover:text-purple-300 underline font-medium"
              >
                Ver todas
              </button>
            </div>
          )}

          {/* Sub Tabs: Canciones, Álbumes, Artistas, Carpetas */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
              <button
                onClick={() => setSubTab('tracks')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  subTab === 'tracks' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Canciones ({searchQuery ? filteredTracks.length : tracks.length})</span>
              </button>
              <button
                onClick={() => setSubTab('albums')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  subTab === 'albums' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Disc className="w-3.5 h-3.5" />
                <span>Álbumes ({albumGroups.length})</span>
              </button>
              <button
                onClick={() => setSubTab('artists')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  subTab === 'artists' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mic2 className="w-3.5 h-3.5" />
                <span>Artistas ({artistGroups.length})</span>
              </button>
              <button
                onClick={() => setSubTab('folders')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  subTab === 'folders' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Carpetas ({folderGroups.length})</span>
              </button>
            </div>

            {subTab === 'tracks' && (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="title" className="bg-slate-900 text-white">Título</option>
                  <option value="artist" className="bg-slate-900 text-white">Artista</option>
                  <option value="duration" className="bg-slate-900 text-white">Duración</option>
                </select>
              </div>
            )}
          </div>

          {/* SubTab 1: Canciones */}
          {subTab === 'tracks' && (
            <div className="space-y-1.5">
              {sortedTracks.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-white/[0.02] rounded-3xl border border-white/5 space-y-3">
                  <Search className="w-10 h-10 mx-auto text-purple-400 opacity-60" />
                  <h3 className="text-base font-bold text-white">No se encontraron canciones</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Ninguna canción coincide con el título o artista &ldquo;{searchQuery}&rdquo;.
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 text-xs font-semibold border border-purple-500/30 hover:bg-purple-600/30 transition-colors"
                  >
                    Borrar búsqueda
                  </button>
                </div>
              ) : (
                sortedTracks.map((track, idx) => (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer group ${
                    currentTrack?.id === track.id
                      ? 'bg-purple-950/50 border border-purple-500/40 shadow-lg'
                      : 'bg-white/[0.02] hover:bg-white/[0.06] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-slate-400 w-5 text-center">
                      {idx + 1}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-purple-900/30 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 overflow-hidden">
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-5 h-5" />
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
                      <p className="text-xs text-slate-400 truncate">
                        {track.artist} · <span className="text-slate-400">{track.album}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-purple-400/80">
                        <span>{track.format?.toUpperCase()}</span>
                        <span>·</span>
                        <span>{track.fileSize}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(track.id);
                      }}
                      className="p-2 rounded-full text-slate-400 hover:text-white transition-colors"
                      title={track.isFavorite ? 'Quitar de favoritos' : 'Favorito'}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          track.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaylistMenuTrackId(
                            playlistMenuTrackId === track.id ? null : track.id
                          );
                        }}
                        className="p-2 rounded-full text-slate-400 hover:text-white transition-colors"
                        title="Añadir a playlist"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      {playlistMenuTrackId === track.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-10 z-30 w-48 bg-slate-900 border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95"
                        >
                          <p className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                            Añadir a playlist
                          </p>
                          {playlists.length === 0 ? (
                            <p className="text-xs text-slate-400 p-2">No hay playlists creadas</p>
                          ) : (
                            playlists.map((pl) => (
                              <button
                                key={pl.id}
                                onClick={() => {
                                  onAddTrackToPlaylist(pl.id, track.id);
                                  setPlaylistMenuTrackId(null);
                                }}
                                className="w-full text-left px-2.5 py-1.5 text-xs text-slate-200 hover:bg-purple-600 rounded-lg transition-colors truncate"
                              >
                                {pl.name}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCustomTrack(track.id);
                      }}
                      className="p-2 rounded-full text-slate-400 hover:text-rose-400 transition-colors"
                      title="Quitar de la biblioteca"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-purple-600 flex items-center justify-center text-slate-300 group-hover:text-white transition-all ml-1"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
              )))}
            </div>
          )}

          {/* SubTab 2: Álbumes */}
          {subTab === 'albums' && (
            albumGroups.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-white/[0.02] rounded-3xl border border-white/5 space-y-3">
                <Disc className="w-10 h-10 mx-auto text-purple-400 opacity-60" />
                <h3 className="text-base font-bold text-white">No se encontraron álbumes</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Ningún álbum coincide con la búsqueda &ldquo;{searchQuery}&rdquo;.
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 text-xs font-semibold border border-purple-500/30 hover:bg-purple-600/30 transition-colors"
                  >
                    Borrar búsqueda
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {albumGroups.map((album) => (
                  <div
                    key={album.name}
                    onClick={() => onPlayTrack(album.tracks[0])}
                    className="bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 rounded-2xl p-3.5 cursor-pointer group transition-all"
                  >
                    <div className="aspect-square rounded-xl bg-purple-950/40 border border-purple-500/20 mb-2.5 flex items-center justify-center text-purple-400 relative overflow-hidden">
                      <Disc className="w-10 h-10 opacity-70 group-hover:rotate-45 transition-transform duration-500" />
                      <button
                        className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </button>
                    </div>
                    <h4 className="text-sm font-semibold text-white truncate">{album.name}</h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{album.artist}</p>
                    <span className="text-[11px] text-purple-400 font-mono mt-1 block">
                      {album.count} {album.count === 1 ? 'canción' : 'canciones'}
                    </span>
                  </div>
                ))}
              </div>
            )
          )}

          {/* SubTab 3: Artistas */}
          {subTab === 'artists' && (
            artistGroups.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-white/[0.02] rounded-3xl border border-white/5 space-y-3">
                <Mic2 className="w-10 h-10 mx-auto text-purple-400 opacity-60" />
                <h3 className="text-base font-bold text-white">No se encontraron artistas</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Ningún artista coincide con la búsqueda &ldquo;{searchQuery}&rdquo;.
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 text-xs font-semibold border border-purple-500/30 hover:bg-purple-600/30 transition-colors"
                  >
                    Borrar búsqueda
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {artistGroups.map((artist) => (
                  <div
                    key={artist.name}
                    onClick={() => onPlayTrack(artist.tracks[0])}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
                        <Mic2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                          {artist.name}
                        </h4>
                        <span className="text-xs text-slate-400">
                          {artist.count} {artist.count === 1 ? 'canción' : 'canciones'}
                        </span>
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-slate-400 group-hover:text-white fill-current transition-colors" />
                  </div>
                ))}
              </div>
            )
          )}

          {/* SubTab 4: Carpetas */}
          {subTab === 'folders' && (
            folderGroups.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-white/[0.02] rounded-3xl border border-white/5 space-y-3">
                <Folder className="w-10 h-10 mx-auto text-purple-400 opacity-60" />
                <h3 className="text-base font-bold text-white">No se encontraron carpetas</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Ninguna carpeta coincide con la búsqueda &ldquo;{searchQuery}&rdquo;.
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 text-xs font-semibold border border-purple-500/30 hover:bg-purple-600/30 transition-colors"
                  >
                    Borrar búsqueda
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {folderGroups.map((folder) => (
                  <div
                    key={folder.name}
                    onClick={() => onPlayTrack(folder.tracks[0])}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                          {folder.name}
                        </h4>
                        <span className="text-xs text-slate-400">
                          {folder.count} archivos de audio compatibles
                        </span>
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-slate-400 group-hover:text-white fill-current" />
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};
