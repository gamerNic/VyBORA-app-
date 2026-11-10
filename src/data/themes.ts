import { ThemeColors, ThemePreset } from '../types/music';

export const THEMES: Record<ThemePreset, ThemeColors> = {
  'electric-purple': {
    id: 'electric-purple',
    name: 'Morado Eléctrico',
    primary: '#a855f7',
    primaryGlow: 'rgba(168, 85, 247, 0.45)',
    secondary: '#06b6d4',
    accentBg: 'from-purple-900/40 via-purple-950/20 to-black',
    gradient: 'from-purple-500 to-indigo-500',
    borderGlow: 'border-purple-500/40',
  },
  'cyber-neon': {
    id: 'cyber-neon',
    name: 'Neón Cyberpunk',
    primary: '#ec4899',
    primaryGlow: 'rgba(236, 72, 153, 0.45)',
    secondary: '#38bdf8',
    accentBg: 'from-pink-900/40 via-purple-950/20 to-black',
    gradient: 'from-pink-500 to-cyan-400',
    borderGlow: 'border-pink-500/40',
  },
  'deep-blue': {
    id: 'deep-blue',
    name: 'Azul Profundo',
    primary: '#3b82f6',
    primaryGlow: 'rgba(59, 130, 246, 0.45)',
    secondary: '#14b8a6',
    accentBg: 'from-blue-900/40 via-slate-950 to-black',
    gradient: 'from-blue-500 to-cyan-500',
    borderGlow: 'border-blue-500/40',
  },
  'radioactive-emerald': {
    id: 'radioactive-emerald',
    name: 'Esmeralda Neón',
    primary: '#10b981',
    primaryGlow: 'rgba(16, 185, 129, 0.45)',
    secondary: '#84cc16',
    accentBg: 'from-emerald-900/40 via-slate-950 to-black',
    gradient: 'from-emerald-400 to-teal-500',
    borderGlow: 'border-emerald-500/40',
  },
  'aurora-borealis': {
    id: 'aurora-borealis',
    name: 'Aurora Boreal',
    primary: '#8b5cf6',
    primaryGlow: 'rgba(139, 92, 246, 0.45)',
    secondary: '#2dd4bf',
    accentBg: 'from-violet-900/40 via-teal-950/20 to-black',
    gradient: 'from-violet-500 via-teal-400 to-emerald-400',
    borderGlow: 'border-teal-500/40',
  },
};

export const EQUALIZER_PRESETS: Record<string, {
  name: string;
  bands: { 60: number; 230: number; 910: number; 3600: number; 14000: number };
  bassBoost: number;
  virtualizer: number;
}> = {
  Flat: {
    name: 'Plano (Flat)',
    bands: { 60: 0, 230: 0, 910: 0, 3600: 0, 14000: 0 },
    bassBoost: 0,
    virtualizer: 0,
  },
  BassBoost: {
    name: 'Refuerzo de Bajos',
    bands: { 60: 8, 230: 5, 910: 0, 3600: 1, 14000: 2 },
    bassBoost: 80,
    virtualizer: 20,
  },
  Rock: {
    name: 'Rock Enérgico',
    bands: { 60: 6, 230: 3, 910: -2, 3600: 4, 14000: 6 },
    bassBoost: 40,
    virtualizer: 30,
  },
  Pop: {
    name: 'Pop & Voces',
    bands: { 60: 2, 230: 4, 910: 5, 3600: 3, 14000: 2 },
    bassBoost: 20,
    virtualizer: 25,
  },
  Electronic: {
    name: 'Electrónica / Club',
    bands: { 60: 7, 230: 6, 910: 1, 3600: 4, 14000: 8 },
    bassBoost: 75,
    virtualizer: 50,
  },
  Jazz: {
    name: 'Jazz & Acústico',
    bands: { 60: 3, 230: 2, 910: 2, 3600: 3, 14000: 4 },
    bassBoost: 15,
    virtualizer: 35,
  },
  Vocal: {
    name: 'Claridad Vocal',
    bands: { 60: -2, 230: 1, 910: 6, 3600: 6, 14000: 3 },
    bassBoost: 0,
    virtualizer: 15,
  },
  Surround3D: {
    name: 'Inmersión 3D Atmosférica',
    bands: { 60: 5, 230: 2, 910: 0, 3600: 5, 14000: 7 },
    bassBoost: 50,
    virtualizer: 90,
  },
};
