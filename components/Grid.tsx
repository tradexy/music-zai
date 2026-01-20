import React from 'react';
import { StepData } from '../types';
import { NOTES, NOTES as ALL_NOTES, BASE_OCTAVE } from '../constants';

interface GridProps {
  steps: StepData[];
  currentStep: number;
  onStepChange: (index: number, data: StepData) => void;
}

const Grid: React.FC<GridProps> = ({ steps, currentStep, onStepChange }) => {
  
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
        <div className="grid grid-cols-[60px_repeat(16,minmax(40px,1fr))] gap-1 p-4 bg-zinc-950">
          
          {/* Header Row (Step Numbers) */}
          <div className="h-8"></div>
          {steps.map((_, i) => (
            <div key={i} className={`flex flex-col items-center justify-end pb-1 border-b-2 ${currentStep === i ? 'border-emerald-500 text-emerald-400' : 'border-zinc-800 text-zinc-600'}`}>
              <span className="text-xs font-mono font-bold">{i + 1}</span>
            </div>
          ))}

          {/* Grid Rows */}
          {pitchRows.map((pitchIndex) => (
            <React.Fragment key={pitchIndex}>
              {/* Note Label */}
              <div className="flex items-center justify-end pr-3 h-10">
                <span className={`text-xs font-bold ${[1,3,6,8,10].includes(pitchIndex) ? 'text-zinc-600' : 'text-zinc-300'}`}>
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
                    className={`
                      h-10 rounded-sm border transition-all duration-75 relative
                      ${isActive 
                        ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                        : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                      }
                      ${isPlaying ? 'brightness-150' : ''}
                      ${!isActive && [1,3,6,8,10].includes(pitchIndex) ? 'bg-zinc-900/50' : ''} 
                    `}
                  >
                   {isActive && step.accent && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-sm" />}
                   {isActive && step.slide && <div className="absolute bottom-0 right-0 w-full h-1 bg-indigo-400" />}
                  </button>
                );
              })}
            </React.Fragment>
          ))}

          {/* Footer Controls (Slide/Accent Toggles) */}
          <div className="h-8 flex items-center justify-end pr-3 text-xs text-zinc-500 font-bold uppercase">Accent</div>
          {steps.map((step, i) => (
            <button
              key={`accent-${i}`}
              onClick={() => toggleAccent(i)}
              className={`h-6 mt-1 rounded text-[10px] font-bold border ${step.accent ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'border-zinc-800 text-zinc-600 hover:border-zinc-600'}`}
            >
              ACC
            </button>
          ))}

          <div className="h-8 flex items-center justify-end pr-3 text-xs text-zinc-500 font-bold uppercase">Slide</div>
          {steps.map((step, i) => (
            <button
              key={`slide-${i}`}
              onClick={() => toggleSlide(i)}
              className={`h-6 mt-1 rounded text-[10px] font-bold border ${step.slide ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'border-zinc-800 text-zinc-600 hover:border-zinc-600'}`}
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
