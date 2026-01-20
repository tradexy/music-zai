import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { StepData, MidiDevice, MidiMessageLog, SynthParams, WaveformType } from './types';
import { DEFAULT_STEPS, NOTES, BASE_OCTAVE } from './constants';
import { midiService } from './services/midiService';
import { audioEngine } from './services/audioEngine';
import Grid from './components/Grid';
import ControlPanel from './components/ControlPanel';
import MidiMonitor from './components/MidiMonitor';

function App() {
  // State
  const [steps, setSteps] = useState<StepData[]>(DEFAULT_STEPS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [tempo, setTempo] = useState(120);
  
  // MIDI State
  const [midiDevices, setMidiDevices] = useState<MidiDevice[]>([]);
  const [selectedMidiId, setSelectedMidiId] = useState<string | null>(null);
  const [midiChannel, setMidiChannel] = useState(0);
  const [midiLogs, setMidiLogs] = useState<MidiMessageLog[]>([]);

  // Synth Params
  const [synthParams, setSynthParams] = useState<SynthParams>({
    cutoff: 1000,
    resonance: 5,
    decay: 0.2,
    distortion: 0.1,
    waveform: WaveformType.SAWTOOTH
  });

  // Refs for audio scheduling to avoid stale closures in Tone.js callback
  const stepsRef = useRef(steps);
  const midiIdRef = useRef(selectedMidiId);
  
  // Sync refs
  useEffect(() => { stepsRef.current = steps; }, [steps]);
  useEffect(() => { midiIdRef.current = selectedMidiId; }, [selectedMidiId]);
  useEffect(() => { midiService.setChannel(midiChannel); }, [midiChannel]);

  // Phase 1: Initialize Audio & MIDI
  useEffect(() => {
    const init = async () => {
      try {
        await midiService.initialize();
        setMidiDevices(midiService.getOutputs());
      } catch (e) {
        console.warn("MIDI Init failed (expected if not supported)", e);
      }
      
      // Tone.js requires user gesture usually, initialized on Play
    };
    init();
  }, []);

  // Update Synth Params real-time
  useEffect(() => {
    audioEngine.updateParams(synthParams);
  }, [synthParams]);

  // MIDI Logging Helper
  const addMidiLog = useCallback((log: MidiMessageLog | null) => {
    if (log) {
      setMidiLogs(prev => [...prev.slice(-49), log]); // Keep last 50
    }
  }, []);

  // Scheduler Logic (Phase 1.2: Stabilize Timing)
  useEffect(() => {
    // Cancel previous
    Tone.Transport.cancel();

    const loop = (time: number) => {
      // Calculate step index from Transport position
      // Tone.Transport.position is bars:quarters:sixteenths. 
      // We want a 16th note loop.
      const sixteenth = Tone.Transport.position.toString().split(':')[2];
      const quarter = Tone.Transport.position.toString().split(':')[1];
      // 16 steps = 4 quarters * 4 sixteenths
      const stepIndex = (parseInt(quarter) * 4 + Math.floor(parseFloat(sixteenth))) % 16;
      
      // Sync UI
      Tone.Draw.schedule(() => {
        setCurrentStep(stepIndex);
      }, time);

      const currentStepData = stepsRef.current[stepIndex];

      // --- Internal Audio Engine Trigger ---
      if (currentStepData.active) {
        const noteName = `${NOTES[currentStepData.noteIndex]}${BASE_OCTAVE}`;
        
        // Logic for Slide (Phase 2.1)
        const duration = currentStepData.slide ? '8n' : '16n'; 
        const velocity = currentStepData.accent ? 1.0 : 0.6;
        
        audioEngine.triggerStep(
            noteName, 
            duration, 
            time, 
            velocity, 
            currentStepData.slide // Pass slide flag to engine
        );
      }

      // --- External MIDI Output (Phase 1.1) ---
      if (currentStepData.active) {
        const midiNote = 36 + currentStepData.noteIndex; // C2 = 36
        const velocity = currentStepData.accent ? 127 : 90;

        // Send Note ON
        Tone.Draw.schedule(() => {
             const logOn = midiService.sendNoteOn(midiNote, velocity);
             addMidiLog(logOn);
        }, time);

        // Schedule Note OFF
        // If Slide is ON, we delay Note Off until the NEXT step starts (creating overlap).
        // If Slide is OFF, we send Note Off after ~80% of a 16th note (gate time).
        
        const stepDuration = Tone.Time('16n').toSeconds();
        const gateLength = currentStepData.slide ? stepDuration * 1.1 : stepDuration * 0.5;

        Tone.Draw.schedule(() => {
            const logOff = midiService.sendNoteOff(midiNote);
            addMidiLog(logOff);
        }, time + gateLength);
      }
    };

    // Schedule the loop
    const eventId = Tone.Transport.scheduleRepeat(loop, "16n");

    return () => {
      Tone.Transport.clear(eventId);
    };
  }, [addMidiLog]);

  // Tempo Sync
  useEffect(() => {
    Tone.Transport.bpm.value = tempo;
  }, [tempo]);

  const handleTogglePlay = async () => {
    if (!isPlaying) {
      await audioEngine.initialize();
      Tone.Transport.start();
      setIsPlaying(true);
    } else {
      Tone.Transport.stop();
      setCurrentStep(-1);
      midiService.stopAllNotes(); // Panic button essentially
      setIsPlaying(false);
    }
  };

  const handleStepChange = (index: number, data: StepData) => {
    const newSteps = [...steps];
    newSteps[index] = data;
    setSteps(newSteps);
  };

  const handleClear = () => {
    setSteps(DEFAULT_STEPS.map(s => ({ ...s, active: false, slide: false, accent: false })));
  };

  return (
    <div className="flex flex-col h-screen bg-black text-zinc-300 overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center px-4 justify-between">
        <h1 className="text-xl font-black tracking-tighter italic text-zinc-100">
          music<span className="text-emerald-500">-zai</span>
        </h1>
        <div className="text-xs font-mono text-zinc-600">
            v1.0.0 | Acid Sequencer
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        
        {/* Left: Sequencer & Controls */}
        <div className="flex-1 flex flex-col min-w-0">
          <ControlPanel 
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onClear={handleClear}
            tempo={tempo}
            setTempo={setTempo}
            params={synthParams}
            setParams={setSynthParams}
          />
          
          <div className="flex-1 overflow-y-auto bg-zinc-900/50 p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl overflow-hidden">
                <Grid 
                    steps={steps} 
                    currentStep={currentStep} 
                    onStepChange={handleStepChange} 
                />
            </div>
            
            <div className="mt-6 text-zinc-500 text-sm max-w-2xl mx-auto text-center space-y-2">
                <p><strong>Instructions:</strong> Click grid to toggle notes. Use "SLD" for portamento (Slide) and "ACC" for Accent.</p>
                <p>Connect your hardware synth via USB-MIDI and select it in the right panel.</p>
            </div>
          </div>
        </div>

        {/* Right: MIDI Monitor (Phase 1 Debugging) */}
        <MidiMonitor 
            logs={midiLogs}
            devices={midiDevices}
            selectedDevice={selectedMidiId}
            onSelectDevice={(id) => { setSelectedMidiId(id); midiService.setOutput(id); }}
            channel={midiChannel}
            onSetChannel={setMidiChannel}
        />
      </div>
    </div>
  );
}

export default App;