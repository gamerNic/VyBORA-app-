import { Track, Playlist } from '../types/music';

// High-resolution album artwork assets for visual themes
export const ALBUM_COVERS = {
  neonAurora: '/src/assets/images/album_neon_aurora_1793947476383.jpg',
  midnightDrive: '/src/assets/images/album_midnight_drive_1793947477640.jpg',
  cosmicSoul: '/src/assets/images/album_cosmic_soul_1793947478185.jpg',
  cyberPulse: '/src/assets/images/album_cyber_pulse_1793947477841.jpg',
};

// No fake or mock songs: the library is populated exclusively by real audio files scanned from the device
export const INITIAL_TRACKS: Track[] = [];

export const INITIAL_PLAYLISTS: Playlist[] = [];
