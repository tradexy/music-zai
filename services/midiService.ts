import { MidiDevice, MidiMessageLog } from '../types';

class MidiService {
  private access: MIDIAccess | null = null;
  private output: MIDIOutput | null = null;
  private channel: number = 0; // 0-15 (Channel 1-16)

  public async initialize(): Promise<void> {
    if (navigator.requestMIDIAccess) {
      try {
        this.access = await navigator.requestMIDIAccess();
      } catch (err) {
        console.error('MIDI Access Failed', err);
        throw new Error('MIDI Access Refused or Unsupported');
      }
    } else {
      throw new Error('Web MIDI API not supported in this browser');
    }
  }

  public getOutputs(): MidiDevice[] {
    if (!this.access) return [];
    const devices: MidiDevice[] = [];
    this.access.outputs.forEach((output) => {
      devices.push({ id: output.id, name: output.name || 'Unknown Device' });
    });
    return devices;
  }

  public setOutput(id: string): void {
    if (!this.access) return;
    this.output = this.access.outputs.get(id) || null;
  }

  public setChannel(channel: number): void {
    this.channel = Math.max(0, Math.min(15, channel));
  }

  // Phase 2.1: Logic for Note Overlap
  // To simulate slide on hardware synths (Mono/Legato mode), we send the new Note On
  // BEFORE the old Note Off if sliding.
  public sendNoteOn(note: number, velocity: number = 100): MidiMessageLog | null {
    if (!this.output) return null;

    // Status byte: 0x90 (Note On) + Channel
    const status = 0x90 + this.channel;
    const data = [status, note, velocity];
    
    try {
      this.output.send(data);
      return {
        timestamp: Date.now(),
        data: data,
        description: `Note On  | Ch: ${this.channel + 1} | Note: ${note} | Vel: ${velocity}`
      };
    } catch (e) {
      console.error("Failed to send MIDI Note On", e);
      return null;
    }
  }

  public sendNoteOff(note: number): MidiMessageLog | null {
    if (!this.output) return null;

    // Status byte: 0x80 (Note Off) + Channel
    const status = 0x80 + this.channel;
    const data = [status, note, 0];

    try {
      this.output.send(data);
      return {
        timestamp: Date.now(),
        data: data,
        description: `Note Off | Ch: ${this.channel + 1} | Note: ${note}`
      };
    } catch (e) {
      console.error("Failed to send MIDI Note Off", e);
      return null;
    }
  }

  public stopAllNotes(): void {
    if (!this.output) return;
    // Send "All Notes Off" control change (CC 123)
    const status = 0xB0 + this.channel; // Control Change
    this.output.send([status, 123, 0]);
  }
}

export const midiService = new MidiService();