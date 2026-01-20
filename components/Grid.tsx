import React from 'react';
import { StepData, Theme } from '../types';
import { NOTES, BASE_OCTAVE } from '../constants';

interface GridProps {
  steps: StepData[];
  currentStep: number;
  onStepChange: (index: number, data: StepData) => void;
  theme: Theme;
}

const Grid: React.FC<GridProps> = ({ steps, currentStep, onStepChange, theme }) => {

  // Inverse loop for display (High notes at top)
  const pitchRows = Array.from({ length: 12 }, (_, i) => 11 - i);

  const toggleActive = (stepIndex: number, noteIndex: number) => {
    const step = steps[stepIndex];
    if (step.active && step.noteIndex === noteIndex) {
      // Turn off
      onStepChange(stepIndex, { ...step, active: false });
    } else {
      // Turn on (and set note)
      onStepChange(stepIndex, { ...step, active: true, noteIndex });
    }
  };

  const toggleAccent = (stepIndex: number) => {
    onStepChange(stepIndex, { ...steps[stepIndex], accent: !steps[stepIndex].accent });
  };

  const toggleSlide = (stepIndex: number) => {
    onStepChange(stepIndex, { ...steps[stepIndex], slide: !steps[stepIndex].slide });
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="inline-block min-w-full">
        <div
          className="grid grid-cols-[60px_repeat(16,minmax(40px,1fr))] gap-1 p-4"
          style={{ backgroundColor: theme.background }}
        >

          {/* Header Row (Step Numbers) */}
          <div className="h-8"></div>
          {steps.map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-end pb-1 border-b-2"
              style={{
                borderColor: currentStep === i ? theme.primary : theme.border,
                color: currentStep === i ? theme.primary : theme.textMuted
              }}
            >
              <span className="text-xs font-mono font-bold">{i + 1}</span>
            </div>
          ))}

          {/* Grid Rows */}
          {pitchRows.map((pitchIndex) => (
            <React.Fragment key={pitchIndex}>
              {/* Note Label */}
              <div className="flex items-center justify-end pr-3 h-10">
                <span
                  className="text-xs font-bold"
                  style={{ color: [1, 3, 6, 8, 10].includes(pitchIndex) ? theme.textMuted : theme.text }}
                >
                  {NOTES[pitchIndex]}{BASE_OCTAVE}
                </span>
              </div>

              {/* Steps for this pitch */}
              {steps.map((step, stepIndex) => {
                const isActive = step.active && step.noteIndex === pitchIndex;
                const isPlaying = currentStep === stepIndex;

                return (
                  <button
                    key={stepIndex}
                    onClick={() => toggleActive(stepIndex, pitchIndex)}
                    className="h-10 rounded-sm border transition-all duration-75 relative hover:opacity-80"
                    style={{
                      backgroundColor: isActive ? theme.primary : ([1, 3, 6, 8, 10].includes(pitchIndex) ? `${theme.surface}88` : theme.surface),
                      borderColor: isActive ? theme.primary : theme.border,
                      boxShadow: isActive ? `0 0 10px ${theme.primary}66` : 'none',
                      filter: isPlaying ? 'brightness(1.5)' : 'none'
                    }}
                  >
                    {isActive && step.accent && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-sm" />}
                    {isActive && step.slide && <div className="absolute bottom-0 right-0 w-full h-1 bg-indigo-400" />}
                  </button>
                );
              })}
            </React.Fragment>
          ))}

          {/* Footer Controls (Slide/Accent Toggles) */}
          <div className="h-8 flex items-center justify-end pr-3 text-xs font-bold uppercase" style={{ color: theme.textMuted }}>Accent</div>
          {steps.map((step, i) => (
            <button
              key={`accent-${i}`}
              onClick={() => toggleAccent(i)}
              className={`h-6 mt-1 rounded text-[10px] font-bold border ${step.accent ? 'bg-amber-500/20 border-amber-500 text-amber-500' : ''}`}
              style={{ borderColor: step.accent ? undefined : theme.border, color: step.accent ? undefined : theme.textMuted }}
            >
              ACC
            </button>
          ))}

          <div className="h-8 flex items-center justify-end pr-3 text-xs font-bold uppercase" style={{ color: theme.textMuted }}>Slide</div>
          {steps.map((step, i) => (
            <button
              key={`slide-${i}`}
              onClick={() => toggleSlide(i)}
              className={`h-6 mt-1 rounded text-[10px] font-bold border ${step.slide ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : ''}`}
              style={{ borderColor: step.slide ? undefined : theme.border, color: step.slide ? undefined : theme.textMuted }}
            >
              SLD
            </button>
          ))}

        </div>
      </div>
    </div>
  );
};

export default Grid;
