import { Track, EqualizerSettings } from '../types/music';
import { getRealWavTrackUrl } from './realAudioGenerator';

export interface AudioErrorDetails {
  code: number | string;
  message: string;
  trackTitle?: string;
}

type AudioEventListener = (data?: any) => void;

class AudioEngine {
  private audioElement: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  // Equalizer DSP Nodes
  private filterNodes: { [frequency: number]: BiquadFilterNode } = {};
  private bassFilterNode: BiquadFilterNode | null = null;

  private currentTrack: Track | null = null;
  private isPlaying = false;
  private currentTime = 0;
  private duration = 0;
  private playbackRate = 1.0;
  private volume = 1.0;
  private eventListeners: { [event: string]: AudioEventListener[] } = {};

  constructor() {
    this.initAudioElement();
  }

  private initAudioElement() {
    if (typeof window === 'undefined') return;

    this.audioElement = new Audio();
    this.audioElement.preload = 'metadata';
    // Ensure volume is not zero
    this.audioElement.volume = this.volume;

    // Real playback events driven purely by HTMLAudioElement
    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      this.updateMediaSessionState();
      this.emit('play');
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updateMediaSessionState();
      this.emit('pause');
    });

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement) {
        this.currentTime = this.audioElement.currentTime;
        if (!isNaN(this.audioElement.duration) && this.audioElement.duration > 0) {
          this.duration = this.audioElement.duration;
        }
        this.emit('timeupdate', {
          currentTime: this.currentTime,
          duration: this.duration,
        });
        this.updateMediaSessionPosition();
      }
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      if (this.audioElement) {
        if (!isNaN(this.audioElement.duration) && this.audioElement.duration > 0) {
          this.duration = this.audioElement.duration;
        } else if (this.currentTrack?.duration) {
          this.duration = this.currentTrack.duration;
        }
        this.emit('durationchange', this.duration);
        this.updateMediaSessionPosition();
      }
    });

    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      this.emit('ended');
    });

    this.audioElement.addEventListener('error', () => {
      // Ignore if no track is actively assigned or src is unset
      if (!this.currentTrack || !this.audioElement?.src || this.audioElement.src === window.location.href) {
        return;
      }
      const err = this.audioElement.error;
      if (!err || !err.code) {
        return;
      }

      let message = 'Error al reproducir el archivo de audio.';
      const code: number | string = err.code;

      switch (err.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          message = 'La reproducción fue cancelada por el usuario.';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          message = 'Error de red al intentar descargar o leer el audio.';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          message = 'El archivo de audio está dañado o el códec no es compatible con tu navegador.';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          message = 'Formato de audio no compatible o la ruta del archivo ya no es accesible.';
          break;
      }

      console.warn('AudioElement MediaError code:', code, message);
      this.isPlaying = false;
      this.emit('pause');
      this.emit('error', {
        code,
        message,
        trackTitle: this.currentTrack?.title,
      } as AudioErrorDetails);
    });
  }

  /**
   * Initializes Web Audio API Equalizer and Spectrum Analyser graph.
   * Graph: Source -> BassFilter -> EQ[60] -> EQ[230] -> EQ[910] -> EQ[3600] -> EQ[14000] -> Gain -> Analyser -> Destination
   */
  public initWebAudio() {
    if (this.audioCtx || typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      this.audioCtx = new AudioContextClass();

      // Master Gain Node
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);

      // Analyser Node for reactive visualizer
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.8;

      // Bass Boost filter (lowshelf at 110 Hz)
      this.bassFilterNode = this.audioCtx.createBiquadFilter();
      this.bassFilterNode.type = 'lowshelf';
      this.bassFilterNode.frequency.value = 110;
      this.bassFilterNode.gain.value = 0;

      // 5 Equalizer Peaking Bands
      const frequencies = [60, 230, 910, 3600, 14000];
      const eqNodes: BiquadFilterNode[] = [];

      frequencies.forEach((freq) => {
        const filter = this.audioCtx!.createBiquadFilter();
        filter.type = freq === 60 ? 'lowshelf' : freq === 14000 ? 'highshelf' : 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1.2;
        filter.gain.value = 0;
        this.filterNodes[freq] = filter;
        eqNodes.push(filter);
      });

      // Chain the nodes linearly:
      // bassFilter -> eq[0] -> eq[1] -> eq[2] -> eq[3] -> eq[4] -> gainNode -> analyserNode -> destination
      this.bassFilterNode.connect(eqNodes[0]);
      for (let i = 0; i < eqNodes.length - 1; i++) {
        eqNodes[i].connect(eqNodes[i + 1]);
      }
      eqNodes[eqNodes.length - 1].connect(this.gainNode);
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioCtx.destination);

      // Connect HTMLAudioElement source
      if (this.audioElement && !this.sourceNode) {
        try {
          this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);
          this.sourceNode.connect(this.bassFilterNode);
        } catch (sourceErr) {
          console.warn('Could not connect HTMLAudioElement to Web Audio graph:', sourceErr);
        }
      }
    } catch (err) {
      console.warn('Web Audio initialization warning:', err);
    }
  }

  /**
   * Loads a track into the real HTMLAudioElement.
   */
  public async setTrack(track: Track, autoPlay = true) {
    if (!track) return;

    // Resolve audio source
    let resolvedSrc = track.src;
    if (resolvedSrc && resolvedSrc.startsWith('synth:')) {
      resolvedSrc = getRealWavTrackUrl(track.id);
    }

    if (!resolvedSrc || resolvedSrc.trim() === '') {
      console.warn('Track has no audio source URL:', track.title);
      return;
    }

    this.currentTrack = track;
    this.currentTime = 0;
    this.duration = track.duration || 0;

    if (!this.audioElement) {
      this.initAudioElement();
    }
    if (!this.audioElement) return;

    try {
      if (resolvedSrc.startsWith('http://') || resolvedSrc.startsWith('https://')) {
        this.audioElement.crossOrigin = 'anonymous';
      } else {
        this.audioElement.removeAttribute('crossorigin');
      }

      this.audioElement.src = resolvedSrc;
      this.audioElement.playbackRate = this.playbackRate;
      this.audioElement.volume = this.volume;
      this.audioElement.load();

      this.updateMediaSessionMetadata(track);
      this.emit('trackchange', track);

      if (autoPlay) {
        await this.play();
      }
    } catch (err: any) {
      console.warn('Error loading track source:', err);
      this.isPlaying = false;
      this.emit('pause');
      this.emit('error', {
        code: 'LOAD_ERROR',
        message: 'No se pudo cargar el archivo de audio. Verifica que el archivo exista y sea compatible.',
        trackTitle: track.title,
      } as AudioErrorDetails);
    }
  }

  /**
   * Resumes or starts real audio playback.
   */
  public async play(): Promise<boolean> {
    if (!this.audioElement) {
      this.initAudioElement();
    }
    if (!this.audioElement) return false;

    // Try initializing Web Audio graph on user gesture
    this.initWebAudio();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch (e) {}
    }

    // Ensure volume is above zero
    if (this.audioElement.volume === 0 && this.volume > 0) {
      this.audioElement.volume = this.volume;
    }

    try {
      await this.audioElement.play();
      this.isPlaying = true;
      this.updateMediaSessionState();
      return true;
    } catch (err: any) {
      this.isPlaying = false;
      this.updateMediaSessionState();
      this.emit('pause');

      // NotAllowedError happens when browser prevents autoplay without click
      let message = 'Toca la pantalla para permitir la reproducción de audio en tu dispositivo.';
      if (err.name !== 'NotAllowedError') {
        message = `Error al reproducir "${this.currentTrack?.title || 'audio'}": ${err.message || 'Formato no soportado'}`;
      }

      this.emit('error', {
        code: err.name || 'PLAY_ERROR',
        message,
        trackTitle: this.currentTrack?.title,
      } as AudioErrorDetails);
      return false;
    }
  }

  /**
   * Pauses real audio playback.
   */
  public pause() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.isPlaying = false;
    this.updateMediaSessionState();
    this.emit('pause');
  }

  /**
   * Toggles play/pause state.
   */
  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Seeks to exact timestamp in seconds.
   */
  public seek(seconds: number) {
    if (!this.audioElement) return;
    const clamped = Math.max(0, Math.min(seconds, this.duration || 999999));
    this.currentTime = clamped;
    this.audioElement.currentTime = clamped;
    this.emit('timeupdate', { currentTime: this.currentTime, duration: this.duration });
    this.updateMediaSessionPosition();
  }

  /**
   * Sets master audio volume (0.0 to 1.0).
   */
  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(vol, 1));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
    this.emit('volumechange', this.volume);
  }

  /**
   * Sets playback speed rate (e.g. 0.75, 1.0, 1.25, 1.5, 2.0).
   */
  public setPlaybackRate(rate: number) {
    this.playbackRate = rate;
    if (this.audioElement) {
      this.audioElement.playbackRate = rate;
    }
    this.emit('ratechange', rate);
  }

  /**
   * Applies equalizer frequency bands and bass boost in real time.
   */
  public applyEqualizer(settings: EqualizerSettings) {
    if (!this.audioCtx) return;

    const currentTime = this.audioCtx.currentTime;

    // Apply frequency bands (-12 to +12 dB)
    Object.entries(settings.bands).forEach(([freqStr, gainDb]) => {
      const freq = parseInt(freqStr);
      const node = this.filterNodes[freq];
      if (node) {
        node.gain.setTargetAtTime(settings.enabled ? gainDb : 0, currentTime, 0.05);
      }
    });

    // Apply Bass Boost filter
    if (this.bassFilterNode) {
      const bassGain = settings.enabled ? (settings.bassBoost / 100) * 12 : 0;
      this.bassFilterNode.gain.setTargetAtTime(bassGain, currentTime, 0.05);
    }
  }

  /**
   * Retrieves frequency byte data for real-time visualizers.
   */
  public getFrequencyData(): Uint8Array {
    if (!this.analyserNode) {
      return new Uint8Array(64).fill(0);
    }
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
  }

  /**
   * Subscribes to engine events.
   */
  public on(event: string, listener: AudioEventListener) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(listener);
    return () => {
      this.eventListeners[event] = (this.eventListeners[event] || []).filter(l => l !== listener);
    };
  }

  private emit(event: string, data?: any) {
    const list = this.eventListeners[event];
    if (list) {
      list.forEach(l => l(data));
    }
  }

  /* ----------------- Android MediaSession API ----------------- */
  private updateMediaSessionMetadata(track: Track) {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: [
          { src: track.coverUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: track.coverUrl, sizes: '128x128', type: 'image/jpeg' },
          { src: track.coverUrl, sizes: '192x192', type: 'image/jpeg' },
          { src: track.coverUrl, sizes: '512x512', type: 'image/jpeg' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.emit('requestprev'));
      navigator.mediaSession.setActionHandler('nexttrack', () => this.emit('requestnext'));
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          this.seek(details.seekTime);
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        this.seek(this.currentTime - (details.seekOffset || 10));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        this.seek(this.currentTime + (details.seekOffset || 10));
      });
    } catch (err) {}
  }

  private updateMediaSessionState() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = this.isPlaying ? 'playing' : 'paused';
    } catch (e) {}
  }

  private updateMediaSessionPosition() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      if ('setPositionState' in navigator.mediaSession && this.duration > 0) {
        navigator.mediaSession.setPositionState({
          duration: this.duration,
          playbackRate: this.playbackRate,
          position: Math.min(this.currentTime, this.duration),
        });
      }
    } catch (e) {}
  }
}

export const audioEngine = new AudioEngine();
