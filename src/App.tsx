/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Track, Playlist, ActiveTab, ThemePreset, RepeatMode, EqualizerSettings } from './types/music';
import { INITIAL_TRACKS, INITIAL_PLAYLISTS } from './data/defaultTracks';
import { THEMES, EQUALIZER_PRESETS } from './data/themes';
import { audioEngine } from './services/audioEngine';
import { Navigation } from './components/Navigation';
import { MiniPlayer } from './components/MiniPlayer';
import { PlayerView } from './components/PlayerView';
import { HomeView } from './components/HomeView';
import { LibraryView } from './components/LibraryView';
import { PlaylistsView } from './components/PlaylistsView';
import { FavoritesView } from './components/FavoritesView';
import { EqualizerView } from './components/EqualizerView';
import { SettingsView } from './components/SettingsView';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import { SplashScreen } from './components/SplashScreen';
import { WelcomeModal } from './components/WelcomeModal';
import { Wifi, BatteryMedium, Signal, Sparkles, FolderPlus } from 'lucide-react';

const STORAGE_KEYS = {
  TRACKS: 'sonora_tracks_v2',
  PLAYLISTS: 'sonora_playlists_v2',
  THEME: 'sonora_theme_v2',
  EQUALIZER: 'sonora_eq_v2',
  LAST_TRACK: 'sonora_last_track_v2',
  PHONE_FRAME: 'sonora_phone_frame_v2',
};

export default function App() {
  // 1. Tracks State
  const [tracks, setTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRACKS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.filter((t: any) => !t.src?.startsWith('synth:'));
      }
    } catch (e) {}
    return INITIAL_TRACKS;
  });

  // 2. Playlists State
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_PLAYLISTS;
  });

  // 3. Theme State
  const [currentThemeKey, setCurrentThemeKey] = useState<ThemePreset>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME) as ThemePreset;
      if (saved && THEMES[saved]) return saved;
    } catch (e) {}
    return 'electric-purple';
  });

  // 4. Equalizer State
  const [equalizer, setEqualizer] = useState<EqualizerSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EQUALIZER);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    const preset = EQUALIZER_PRESETS.BassBoost;
    return {
      enabled: true,
      preset: preset.name,
      bands: { ...preset.bands },
      bassBoost: preset.bassBoost,
      virtualizer: preset.virtualizer,
    };
  });

  // 5. Active Player State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.LAST_TRACK);
      if (savedId) {
        const found = tracks.find((t) => t.id === savedId);
        if (found) return found;
      }
    } catch (e) {}
    return tracks[0] || null;
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(tracks[0]?.duration || 180);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 6. Settings & Modal States
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PHONE_FRAME);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return false;
  });

  const [isAndroidCodeOpen, setIsAndroidCodeOpen] = useState(false);
  const [sleepTimerEnd, setSleepTimerEnd] = useState<number | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Catch PWA / WebAPK install prompt for 1-touch mobile install
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          showToast('¡Instalando VyBORA en tu teléfono!');
        }
      } catch (err) {}
      setDeferredPrompt(null);
    }
  };

  const theme = THEMES[currentThemeKey];

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Synchronize with AudioEngine events
  useEffect(() => {
    const unsubPlay = audioEngine.on('play', () => setIsPlaying(true));
    const unsubPause = audioEngine.on('pause', () => setIsPlaying(false));
    const unsubTime = audioEngine.on('timeupdate', (data) => {
      if (data) {
        setCurrentTime(data.currentTime || 0);
        if (data.duration && !isNaN(data.duration)) setDuration(data.duration);
      }
    });
    const unsubEnded = audioEngine.on('ended', () => handleTrackEnded());
    const unsubPrev = audioEngine.on('requestprev', () => handlePrevTrack());
    const unsubNext = audioEngine.on('requestnext', () => handleNextTrack());
    const unsubError = audioEngine.on('error', (errData) => {
      setIsPlaying(false);
      showToast(errData?.message || 'Error al reproducir el archivo de audio');
    });

    // Apply initial EQ
    audioEngine.applyEqualizer(equalizer);

    return () => {
      unsubPlay();
      unsubPause();
      unsubTime();
      unsubEnded();
      unsubPrev();
      unsubNext();
      unsubError();
    };
  }, [tracks, currentTrack, repeatMode, isShuffle]);

  // Re-hydrate custom audio tracks from IndexedDB so they have active, valid Blob URLs
  useEffect(() => {
    let isMounted = true;
    async function rehydrateCustomBlobs() {
      try {
        const { getAudioFile } = await import('./services/db');
        let hasChanges = false;

        const updatedTracks = await Promise.all(
          tracks.map(async (t) => {
            if (t.isCustomFile) {
              const fileBlob = await getAudioFile(t.id);
              if (fileBlob) {
                hasChanges = true;
                const freshUrl = URL.createObjectURL(fileBlob);
                return { ...t, src: freshUrl };
              }
            }
            return t;
          })
        );

        if (hasChanges && isMounted) {
          setTracks(updatedTracks);
          if (currentTrack?.isCustomFile) {
            const currentMatch = updatedTracks.find((t) => t.id === currentTrack.id);
            if (currentMatch) {
              setCurrentTrack(currentMatch);
            }
          }
        }
      } catch (err) {
        console.warn('Could not rehydrate audio blobs from IndexedDB:', err);
      }
    }

    rehydrateCustomBlobs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(tracks));
    } catch (e) {}
  }, [tracks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    } catch (e) {}
  }, [playlists]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, currentThemeKey);
    } catch (e) {}
  }, [currentThemeKey]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EQUALIZER, JSON.stringify(equalizer));
    } catch (e) {}
    audioEngine.applyEqualizer(equalizer);
  }, [equalizer]);

  useEffect(() => {
    if (currentTrack) {
      try {
        localStorage.setItem(STORAGE_KEYS.LAST_TRACK, currentTrack.id);
      } catch (e) {}
    }
  }, [currentTrack]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PHONE_FRAME, JSON.stringify(isPhoneFrame));
    } catch (e) {}
  }, [isPhoneFrame]);

  // Sleep Timer execution
  useEffect(() => {
    if (!sleepTimerEnd) return;
    const checkTimer = setInterval(() => {
      if (Date.now() >= sleepTimerEnd) {
        audioEngine.pause();
        setSleepTimerEnd(null);
        showToast('Temporizador de apagado completado. Música pausada.');
      }
    }, 1000);
    return () => clearInterval(checkTimer);
  }, [sleepTimerEnd]);

  // Track playback handlers
  const handlePlayTrack = async (track: Track) => {
    if (currentTrack?.id === track.id) {
      audioEngine.togglePlay();
    } else {
      setCurrentTrack(track);
      await audioEngine.setTrack(track, true);
    }
  };

  const handleTogglePlay = () => {
    if (!currentTrack && tracks.length > 0) {
      handlePlayTrack(tracks[0]);
    } else {
      audioEngine.togglePlay();
    }
  };

  const handleNextTrack = () => {
    if (!tracks.length) return;
    if (repeatMode === 'one' && currentTrack) {
      audioEngine.seek(0);
      audioEngine.play();
      return;
    }

    let nextIndex = 0;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else if (currentTrack) {
      const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
      nextIndex = (currentIndex + 1) % tracks.length;
    }
    const nextTrack = tracks[nextIndex];
    if (nextTrack) {
      handlePlayTrack(nextTrack);
    }
  };

  const handlePrevTrack = () => {
    if (!tracks.length) return;
    if (currentTime > 3) {
      audioEngine.seek(0);
      return;
    }
    let prevIndex = tracks.length - 1;
    if (currentTrack) {
      const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
      prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    }
    const prevTrack = tracks[prevIndex];
    if (prevTrack) {
      handlePlayTrack(prevTrack);
    }
  };

  const handleTrackEnded = () => {
    if (repeatMode === 'one') {
      audioEngine.seek(0);
      audioEngine.play();
    } else if (repeatMode === 'all') {
      handleNextTrack();
    } else {
      // Repeat is off
      const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id);
      if (currentIndex < tracks.length - 1) {
        handleNextTrack();
      } else {
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (seconds: number) => {
    audioEngine.seek(seconds);
  };

  const handleToggleShuffle = () => {
    setIsShuffle(!isShuffle);
    showToast(!isShuffle ? 'Modo aleatorio activado' : 'Modo aleatorio desactivado');
  };

  const handleCycleRepeat = () => {
    const modes: RepeatMode[] = ['all', 'one', 'off'];
    const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    setRepeatMode(nextMode);
    const labels = {
      all: 'Repetir toda la lista',
      one: 'Repetir canción actual',
      off: 'Repetición desactivada',
    };
    showToast(labels[nextMode]);
  };

  const handleToggleFavorite = (trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          const nextState = !t.isFavorite;
          showToast(nextState ? `"${t.title}" guardada en Favoritos` : `"${t.title}" quitada de Favoritos`);
          return { ...t, isFavorite: nextState };
        }
        return t;
      })
    );
    if (currentTrack?.id === trackId) {
      setCurrentTrack((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  const handleChangePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    audioEngine.setPlaybackRate(rate);
    showToast(`Velocidad de reproducción: ${rate}x`);
  };

  const handleImportTracks = (newTracks: Track[]) => {
    setTracks((prev) => [...prev, ...newTracks]);
    showToast(`${newTracks.length} ${newTracks.length === 1 ? 'canción importada' : 'canciones importadas'} con éxito`);
    if (newTracks.length > 0 && !isPlaying) {
      handlePlayTrack(newTracks[0]);
    }
  };

  const handleDeleteCustomTrack = async (trackId: string) => {
    try {
      const { deleteAudioFile } = await import('./services/db');
      await deleteAudioFile(trackId);
    } catch (e) {}
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    showToast('Canción eliminada de la biblioteca');
  };

  const handleCreatePlaylist = (name: string, description: string, coverUrl: string) => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      description,
      coverUrl,
      trackIds: [],
      createdAt: Date.now(),
    };
    setPlaylists((prev) => [newPlaylist, ...prev]);
    showToast(`Playlist "${name}" creada`);
  };

  const handleDeletePlaylist = (id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
    showToast('Playlist eliminada');
  };

  const handleAddTrackToPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId && !p.trackIds.includes(trackId)) {
          return { ...p, trackIds: [...p.trackIds, trackId] };
        }
        return p;
      })
    );
    showToast('Canción añadida a la lista');
  };

  const handleRemoveTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          return { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) };
        }
        return p;
      })
    );
    showToast('Canción retirada de la lista');
  };

  const handleShuffleAllFavorites = () => {
    const favorites = tracks.filter((t) => t.isFavorite);
    if (favorites.length === 0) return;
    const randomTrack = favorites[Math.floor(Math.random() * favorites.length)];
    setIsShuffle(true);
    handlePlayTrack(randomTrack);
    showToast('Reproduciendo favoritos en aleatorio');
  };

  const handleSetSleepTimer = (minutes: number) => {
    const endTime = Date.now() + minutes * 60 * 1000;
    setSleepTimerEnd(endTime);
    showToast(`Temporizador fijado para ${minutes} minutos`);
  };

  const handleCancelSleepTimer = () => {
    setSleepTimerEnd(null);
    showToast('Temporizador cancelado');
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col items-center justify-start relative selection:bg-purple-500/30">
      {/* Native Splash Screen on Launch or Preview */}
      {showSplash && (
        <SplashScreen
          theme={theme}
          onFinish={() => setShowSplash(false)}
        />
      )}

      {/* Official VyBORA Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        theme={theme}
        onScanClick={() => setActiveTab('library')}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-purple-500/50 text-white text-xs font-semibold shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container: Full Screen or Simulated Android Phone Frame */}
      <div
        className={`w-full transition-all duration-300 relative ${
          isPhoneFrame
            ? 'max-w-[420px] my-4 rounded-[48px] border-[10px] border-slate-900 bg-black shadow-[0_0_60px_rgba(168,85,247,0.35)] overflow-hidden min-h-[850px]'
            : 'max-w-4xl'
        }`}
      >
        {/* Android Simulated Status Bar (Visible in Phone Frame mode) */}
        {isPhoneFrame && (
          <div className="w-full h-8 px-7 flex items-center justify-between text-[11px] font-mono text-slate-300 pt-1 shrink-0 z-40 bg-black/80">
            <span>22:45</span>
            {/* Center camera notch / punch hole */}
            <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-800 shadow-inner" />
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        )}

        {/* Dynamic Top App Bar with Official VyBORA Logo */}
        <header className="sticky top-0 z-30 px-4 sm:px-5 py-3 bg-black/85 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
          <div
            onClick={() => setShowWelcome(true)}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="Ver pantalla de bienvenida y créditos de VyBORA"
          >
            {/* Official Logo with luminous neon glow */}
            <div className="relative group shrink-0">
              <div
                className="absolute -inset-1 rounded-xl blur-xs opacity-75 group-hover:opacity-100 transition duration-300"
                style={{ background: `linear-gradient(135deg, ${theme.primary}, #06b6d4)` }}
              />
              <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-black p-0.5 border border-white/20 shadow-md">
                <img
                  src="/logo_vybora.png"
                  alt="VyBORA Logo Oficial"
                  className="w-full h-full object-cover rounded-[8px]"
                />
              </div>
            </div>

            <div>
              <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-cyan-400 tracking-wider">
                VyBORA
              </span>
              <span className="text-[10px] font-mono font-semibold text-purple-400 ml-1.5 tracking-tight">
                PRO
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWelcome(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title="Ver pantalla de bienvenida"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline text-[11px]">Bienvenida</span>
            </button>

            <button
              onClick={() => setIsAndroidCodeOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-md active:scale-95 border border-purple-500/40 relative overflow-hidden group"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, #06b6d4)`,
                boxShadow: `0 0 15px ${theme.primaryGlow}`,
              }}
              title="Tu APK lista para instalar en teléfono"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-0.5" />
              <span className="text-[11px] tracking-wide">APK Lista</span>
            </button>
          </div>
        </header>

        {/* Screen Switcher */}
        <main className="w-full min-h-[calc(100vh-140px)]">
          {activeTab === 'home' && (
            <HomeView
              tracks={tracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              theme={theme}
              onPlayTrack={handlePlayTrack}
              onOpenPlayer={() => setIsFullPlayerOpen(true)}
              onGoToLibrary={() => setActiveTab('library')}
              onImportClick={() => setActiveTab('library')}
            />
          )}

          {activeTab === 'library' && (
            <LibraryView
              tracks={tracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              playlists={playlists}
              theme={theme}
              onPlayTrack={handlePlayTrack}
              onToggleFavorite={handleToggleFavorite}
              onImportTracks={handleImportTracks}
              onDeleteCustomTrack={handleDeleteCustomTrack}
              onAddTrackToPlaylist={handleAddTrackToPlaylist}
              onOpenAndroidCode={() => setIsAndroidCodeOpen(true)}
            />
          )}

          {activeTab === 'playlists' && (
            <PlaylistsView
              playlists={playlists}
              tracks={tracks}
              currentTrack={currentTrack}
              theme={theme}
              onPlayTrack={handlePlayTrack}
              onCreatePlaylist={handleCreatePlaylist}
              onDeletePlaylist={handleDeletePlaylist}
              onRemoveTrackFromPlaylist={handleRemoveTrackFromPlaylist}
            />
          )}

          {activeTab === 'favorites' && (
            <FavoritesView
              tracks={tracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              theme={theme}
              onPlayTrack={handlePlayTrack}
              onToggleFavorite={handleToggleFavorite}
              onShuffleAllFavorites={handleShuffleAllFavorites}
              onGoToLibrary={() => setActiveTab('library')}
            />
          )}

          {activeTab === 'equalizer' && (
            <EqualizerView
              equalizer={equalizer}
              theme={theme}
              onUpdateEqualizer={setEqualizer}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              currentTheme={currentThemeKey}
              theme={theme}
              isPhoneFrame={isPhoneFrame}
              onThemeChange={setCurrentThemeKey}
              onTogglePhoneFrame={() => setIsPhoneFrame(!isPhoneFrame)}
              onOpenAndroidCode={() => setIsAndroidCodeOpen(true)}
              onSetSleepTimer={handleSetSleepTimer}
              onCancelSleepTimer={handleCancelSleepTimer}
              sleepTimerEnd={sleepTimerEnd}
              onOpenWelcome={() => setShowWelcome(true)}
              onOpenSplash={() => setShowSplash(true)}
            />
          )}
        </main>

        {/* Floating Mini Player (visible when not in full player modal) */}
        {!isFullPlayerOpen && currentTrack && (
          <MiniPlayer
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onTogglePlay={handleTogglePlay}
            onNext={handleNextTrack}
            onToggleFavorite={handleToggleFavorite}
            onOpenFullPlayer={() => setIsFullPlayerOpen(true)}
            theme={theme}
          />
        )}

        {/* Bottom Android Navigation Bar */}
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          theme={theme}
        />

        {/* Fullscreen Player View Modal */}
        {isFullPlayerOpen && currentTrack && (
          <PlayerView
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            isShuffle={isShuffle}
            repeatMode={repeatMode}
            playbackRate={playbackRate}
            queue={tracks}
            theme={theme}
            onTogglePlay={handleTogglePlay}
            onPrev={handlePrevTrack}
            onNext={handleNextTrack}
            onSeek={handleSeek}
            onToggleShuffle={handleToggleShuffle}
            onCycleRepeat={handleCycleRepeat}
            onToggleFavorite={handleToggleFavorite}
            onChangePlaybackRate={handleChangePlaybackRate}
            onSelectFromQueue={handlePlayTrack}
            onClose={() => setIsFullPlayerOpen(false)}
            onOpenEqualizer={() => {
              setIsFullPlayerOpen(false);
              setActiveTab('equalizer');
            }}
          />
        )}

        {/* Android Native Source Code & Studio Project Exporter Modal */}
        <AndroidCodeModal
          isOpen={isAndroidCodeOpen}
          onClose={() => setIsAndroidCodeOpen(false)}
          theme={theme}
          deferredPrompt={deferredPrompt}
          onInstallApp={handleInstallApp}
        />
      </div>
    </div>
  );
}
