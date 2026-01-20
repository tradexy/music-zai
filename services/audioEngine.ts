import * as Tone from 'tone';
import { SynthParams, WaveformType } from '../types';

// A simple TB-303 emulator using Tone.js
class AudioEngine {
  private synth: Tone.MonoSynth | null = null;
  private distortion: Tone.Distortion | null = null;
  private filter: Tone.Filter | null = null;
  private initialized: boolean = false;

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    await Tone.start();

    this.filter = new Tone.Filter({
      type: "lowpass",
      frequency: 1000,
      rolloff: -24,
      Q: 1
    });

    this.distortion = new Tone.Distortion(0).toDestination();

    this.synth = new Tone.MonoSynth({
      oscillator: {
        type: "sawtooth"
      },
      envelope: {
        attack: 0.005,
        decay: 0.2,
        sustain: 0,
        release: 0.2
      },
      filterEnvelope: {
        attack: 0.005,
        decay: 0.2,
        sustain: 0,
        release: 0.2,
        baseFrequency: 200,
        octaves: 4,
        exponent: 2
      }
    }).connect(this.filter);

    this.filter.connect(this.distortion);
    
    this.initialized = true;
  }

  public updateParams(params: SynthParams): void {
    if (!this.synth || !this.filter || !this.distortion) return;

    this.synth.oscillator.type = params.waveform;
    this.filter.frequency.rampTo(params.cutoff, 0.1);
    this.filter.Q.value = params.resonance;
    this.synth.envelope.decay = params.decay;
    this.synth.filterEnvelope.decay = params.decay;
    this.distortion.distortion = params.distortion;
    
    // Adjust volume to compensate for distortion
    const vol = -10 - (params.distortion * 5); 
    this.synth.volume.rampTo(vol, 0.1);
  }

  public triggerStep(noteName: string, duration: string, time: number, velocity: number, slide: boolean): void {
    if (!this.synth) return;

    // Phase 2.2: Pitch Envelope / Glide
    if (slide) {
      // If sliding, we don't re-trigger attack, we ramp the frequency
      this.synth.triggerAttackRelease(noteName, duration, time, velocity);
      // Tone.js MonoSynth automatically handles portamento if portamento > 0, 
      // but for Acid, overlapping notes with a mono synth is the key.
      this.synth.portamento = 0.1; 
    } else {
      this.synth.portamento = 0;
      this.synth.triggerAttackRelease(noteName, duration, time, velocity);
    }
  }
}

export const audioEngine = new AudioEngine();
