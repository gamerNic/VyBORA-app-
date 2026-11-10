export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  src: string; // URL or blob URL or synthesized generator ID
  coverUrl: string;
  isFavorite: boolean;
  year?: number;
  genre?: string;
  format?: 'mp3' | 'flac' | 'wav' | 'ogg' | 'm4a' | 'audio-buffer';
  bitrate?: string;
  fileSize?: string;
  lyrics?: string[];
  isCustomFile?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  trackIds: string[];
  createdAt: number;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface EqualizerSettings {
  enabled: boolean;
  preset: string;
  bands: {
    60: number;   // -12 to 12 dB
    230: number;  // -12 to 12 dB
    910: number;  // -12 to 12 dB
    3600: number; // -12 to 12 dB
    14000: number;// -12 to 12 dB
  };
  bassBoost: number; // 0 to 100%
  virtualizer: number; // 0 to 100%
}

export type ThemePreset = 'electric-purple' | 'cyber-neon' | 'deep-blue' | 'radioactive-emerald' | 'aurora-borealis';

export interface ThemeColors {
  id: ThemePreset;
  name: string;
  primary: string;
  primaryGlow: string;
  secondary: string;
  accentBg: string;
  gradient: string;
  borderGlow: string;
}

export type ActiveTab = 'home' | 'player' | 'library' | 'playlists' | 'favorites' | 'equalizer' | 'settings' | 'android-native';
