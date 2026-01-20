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
