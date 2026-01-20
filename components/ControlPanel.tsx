import React from 'react';
import { Play, Square, RefreshCw } from 'lucide-react';
import { SynthParams, WaveformType } from '../types';

interface ControlPanelProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClear: () => void;
  tempo: number;
  setTempo: (t: number) => void;
  params: SynthParams;
  setParams: (p: SynthParams) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isPlaying,
  onTogglePlay,
  onClear,
  tempo,
  setTempo,
  params,
  setParams,
}) => {
  
  const updateParam = (key: keyof SynthParams, value: any) => {
    setParams({ ...params, [key]: value });
  };

  return (
    <div className="bg-zinc-900 border-b border-zinc-800 p-4 flex flex-wrap items-center justify-between gap-4">
      {/* Transport & Tempo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onTogglePlay}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
            isPlaying 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
          }`}
        >
          {isPlaying ? <Square size={20} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>

        <div className="flex flex-col">
          <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Tempo</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="60"
              max="180"
              value={tempo}
              onChange={(e) => setTempo(parseInt(e.target.value))}
              className="w-32 accent-emerald-500 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xl font-mono text-emerald-400 w-12">{tempo}</span>
          </div>
        </div>
      </div>

      {/* Synth Params */}
      <div className="flex items-center gap-6 bg-zinc-950/50 p-2 rounded-xl border border-zinc-800">
        <div className="flex flex-col items-center">
            <span className="text-[10px] text-zinc-400 uppercase mb-1">Wave</span>
            <div className="flex bg-zinc-800 rounded p-0.5">
                <button 
                    onClick={() => updateParam('waveform', WaveformType.SAWTOOTH)}
                    className={`p-1 rounded text-xs ${params.waveform === WaveformType.SAWTOOTH ? 'bg-zinc-600 text-white' : 'text-zinc-500'}`}
                >SAW</button>
                <button 
                    onClick={() => updateParam('waveform', WaveformType.SQUARE)}
                    className={`p-1 rounded text-xs ${params.waveform === WaveformType.SQUARE ? 'bg-zinc-600 text-white' : 'text-zinc-500'}`}
                >SQR</button>
            </div>
        </div>

        <Knob label="Cutoff" value={params.cutoff} min={50} max={5000} onChange={(v) => updateParam('cutoff', v)} />
        <Knob label="Reson" value={params.resonance} min={0} max={20} onChange={(v) => updateParam('resonance', v)} />
        <Knob label="Decay" value={params.decay} min={0.1} max={2.0} step={0.1} onChange={(v) => updateParam('decay', v)} />
        <Knob label="Distort" value={params.distortion} min={0} max={1} step={0.05} onChange={(v) => updateParam('distortion', v)} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCw size={16} />
          Clear
        </button>
      </div>
    </div>
  );
};

const Knob = ({ label, value, min, max, step = 1, onChange }: { label: string, value: number, min: number, max: number, step?: number, onChange: (v: number) => void }) => {
    return (
        <div className="flex flex-col items-center gap-1">
            <label className="text-[10px] text-zinc-400 uppercase font-bold">{label}</label>
            <input 
                type="range" 
                min={min} 
                max={max} 
                step={step}
                value={value} 
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-16 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
        </div>
    )
}

export default ControlPanel;