export interface StepData {
  active: boolean;
  noteIndex: number; // 0-11 representing C to B
  accent: boolean;
  slide: boolean;
}

export interface MidiDevice {
  id: string;
  name: string;
}

export interface MidiMessageLog {
  timestamp: number;
  data: number[];
  description: string;
}

export enum WaveformType {
  SAWTOOTH = 'sawtooth',
  SQUARE = 'square',
}

export interface SynthParams {
  cutoff: number;
  resonance: number;
  decay: number;
  distortion: number;
  waveform: WaveformType;
}

export interface SequenceState {
  steps: StepData[];
  tempo: number;
  isPlaying: boolean;
  currentStep: number;
}

export interface Theme {
  name: string;
  primary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
}

export const THEME_PRESETS: Theme[] = [
  {
    name: 'Dark',
    primary: '#10b981', // emerald-500
    background: '#09090b', // zinc-950
    surface: '#18181b', // zinc-900
    text: '#e4e4e7', // zinc-200
    textMuted: '#71717a', // zinc-500
    border: '#27272a', // zinc-800
  },
  {
    name: 'Light',
    primary: '#059669', // emerald-600
    background: '#fafafa', // zinc-50
    surface: '#f4f4f5', // zinc-100
    text: '#18181b', // zinc-900
    textMuted: '#71717a', // zinc-500
    border: '#e4e4e7', // zinc-200
  },
  {
    name: 'Acid',
    primary: '#39ff14', // neon green
    background: '#0a0a0a',
    surface: '#111111',
    text: '#39ff14',
    textMuted: '#1a8c0f',
    border: '#1a3314',
  },
];
