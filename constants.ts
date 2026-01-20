export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const STEPS_COUNT = 16;
export const PITCH_COUNT = 12; // One Octave
export const BASE_OCTAVE = 2; // C2 start

export const DEFAULT_STEPS: import('./types').StepData[] = Array(STEPS_COUNT).fill(null).map(() => ({
  active: false,
  noteIndex: 0, // Default to C
  accent: false,
  slide: false,
}));
