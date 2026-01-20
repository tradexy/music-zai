import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { StepData, MidiDevice, MidiMessageLog, SynthParams, WaveformType, Theme, THEME_PRESETS } from './types';
import { DEFAULT_STEPS, NOTES, BASE_OCTAVE } from './constants';
import { midiService } from './services/midiService';
import { audioEngine } from './services/audioEngine';
import Grid from './components/Grid';
import ControlPanel from './components/ControlPanel';
import MidiMonitor from './components/MidiMonitor';
import { Palette, ChevronDown, ChevronUp } from 'lucide-react';

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

  // Theme State
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEME_PRESETS[0]);
  const [showMidiMonitor, setShowMidiMonitor] = useState(false);

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
    <div
      className="flex flex-col min-h-screen overflow-y-auto transition-colors duration-300"
      style={{ backgroundColor: currentTheme.background, color: currentTheme.text }}
    >
      {/* Top Bar */}
      <header
        className="h-14 border-b flex items-center px-4 justify-between shrink-0"
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
      >
        <h1 className="text-xl font-black tracking-tighter italic">
          music<span style={{ color: currentTheme.primary }}>-zai</span>
        </h1>

        <div className="flex items-center gap-4">
          {/* Theme Selector */}
          <div className="flex items-center gap-2">
            <Palette size={16} style={{ color: currentTheme.textMuted }} />
            <select
              value={currentTheme.name}
              onChange={(e) => setCurrentTheme(THEME_PRESETS.find(t => t.name === e.target.value) || THEME_PRESETS[0])}
              className="px-2 py-1 rounded text-xs font-bold border outline-none cursor-pointer"
              style={{
                backgroundColor: currentTheme.surface,
                color: currentTheme.text,
                borderColor: currentTheme.border
              }}
            >
              {THEME_PRESETS.map(t => (
                <option key={t.name} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="text-xs font-mono" style={{ color: currentTheme.textMuted }}>
            v2.0.0 | Acid Sequencer
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">

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
            theme={currentTheme}
          />

          <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: `${currentTheme.surface}88` }}>
            <div
              className="border rounded-lg shadow-xl overflow-hidden"
              style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.border }}
            >
              <Grid
                steps={steps}
                currentStep={currentStep}
                onStepChange={handleStepChange}
                theme={currentTheme}
              />
            </div>

            <div className="mt-6 text-sm max-w-2xl mx-auto text-center space-y-2" style={{ color: currentTheme.textMuted }}>
              <p><strong>Instructions:</strong> Click grid to toggle notes. Use "SLD" for portamento (Slide) and "ACC" for Accent.</p>
              <p>Connect your hardware synth via USB-MIDI and select it in the panel below.</p>
            </div>
          </div>
        </div>

        {/* Right / Bottom: MIDI Monitor (Collapsible on Mobile) */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowMidiMonitor(!showMidiMonitor)}
            className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold border-t"
            style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border, color: currentTheme.text }}
          >
            {showMidiMonitor ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            MIDI Monitor
          </button>
          {showMidiMonitor && (
            <MidiMonitor
              logs={midiLogs}
              devices={midiDevices}
              selectedDevice={selectedMidiId}
              onSelectDevice={(id) => { setSelectedMidiId(id); midiService.setOutput(id); }}
              channel={midiChannel}
              onSetChannel={setMidiChannel}
              theme={currentTheme}
            />
          )}
        </div>

        {/* Desktop MIDI Monitor */}
        <div className="hidden lg:block">
          <MidiMonitor
            logs={midiLogs}
            devices={midiDevices}
            selectedDevice={selectedMidiId}
            onSelectDevice={(id) => { setSelectedMidiId(id); midiService.setOutput(id); }}
            channel={midiChannel}
            onSetChannel={setMidiChannel}
            theme={currentTheme}
          />
        </div>
      </div>
    </div>
  );
}

export default App;