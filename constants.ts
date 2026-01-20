export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const STEPS_COUNT = 16;
export const PITCH_COUNT = 12; // One Octave
export const BASE_OCTAVE = 2; // C2 start

// Default pattern: 4 notes on beats 1, 5, 9, 13 for immediate sound on Play
export const DEFAULT_STEPS: import('./types').StepData[] = Array(STEPS_COUNT).fill(null).map((_, i) => ({
  active: i % 4 === 0, // Activate steps 0, 4, 8, 12
  noteIndex: 0, // Default to C
  accent: false,
  slide: false,
}));
