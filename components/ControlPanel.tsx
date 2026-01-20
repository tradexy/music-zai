import React from 'react';
import { Play, Square, RefreshCw } from 'lucide-react';
import { SynthParams, WaveformType, Theme } from '../types';

interface ControlPanelProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClear: () => void;
  tempo: number;
  setTempo: (t: number) => void;
  params: SynthParams;
  setParams: (p: SynthParams) => void;
  theme: Theme;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isPlaying,
  onTogglePlay,
  onClear,
  tempo,
  setTempo,
  params,
  setParams,
  theme,
}) => {

  const updateParam = (key: keyof SynthParams, value: any) => {
    setParams({ ...params, [key]: value });
  };

  return (
    <div
      className="border-b p-4 flex flex-wrap items-center justify-between gap-4"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      {/* Transport & Tempo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onTogglePlay}
          className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full transition-all ${isPlaying
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
              : 'text-white shadow-lg hover:scale-105'
            }`}
          style={{ backgroundColor: isPlaying ? undefined : theme.primary }}
        >
          {isPlaying ? <Square size={20} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>

        <div className="flex flex-col">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>Tempo</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="60"
              max="180"
              value={tempo}
              onChange={(e) => setTempo(parseInt(e.target.value))}
              className="w-24 md:w-32 h-2 md:h-3 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: theme.primary, backgroundColor: theme.border }}
            />
            <span className="text-xl font-mono w-12" style={{ color: theme.primary }}>{tempo}</span>
          </div>
        </div>
      </div>

      {/* Synth Params */}
      <div
        className="flex items-center gap-4 md:gap-6 p-2 rounded-xl border"
        style={{ backgroundColor: `${theme.background}88`, borderColor: theme.border }}
      >
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase mb-1" style={{ color: theme.textMuted }}>Wave</span>
          <div className="flex rounded p-0.5" style={{ backgroundColor: theme.border }}>
            <button
              onClick={() => updateParam('waveform', WaveformType.SAWTOOTH)}
              className={`p-1 md:p-1.5 rounded text-xs font-bold ${params.waveform === WaveformType.SAWTOOTH ? 'text-white' : ''}`}
              style={{
                backgroundColor: params.waveform === WaveformType.SAWTOOTH ? theme.primary : 'transparent',
                color: params.waveform === WaveformType.SAWTOOTH ? theme.background : theme.textMuted
              }}
            >SAW</button>
            <button
              onClick={() => updateParam('waveform', WaveformType.SQUARE)}
              className={`p-1 md:p-1.5 rounded text-xs font-bold ${params.waveform === WaveformType.SQUARE ? 'text-white' : ''}`}
              style={{
                backgroundColor: params.waveform === WaveformType.SQUARE ? theme.primary : 'transparent',
                color: params.waveform === WaveformType.SQUARE ? theme.background : theme.textMuted
              }}
            >SQR</button>
          </div>
        </div>

        <Knob label="Cutoff" value={params.cutoff} min={50} max={5000} onChange={(v) => updateParam('cutoff', v)} theme={theme} />
        <Knob label="Reson" value={params.resonance} min={0} max={20} onChange={(v) => updateParam('resonance', v)} theme={theme} />
        <Knob label="Decay" value={params.decay} min={0.1} max={2.0} step={0.1} onChange={(v) => updateParam('decay', v)} theme={theme} />
        <Knob label="Distort" value={params.distortion} min={0} max={1} step={0.05} onChange={(v) => updateParam('distortion', v)} theme={theme} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
          style={{ backgroundColor: theme.border, color: theme.text }}
        >
          <RefreshCw size={16} />
          Clear
        </button>
      </div>
    </div>
  );
};

const Knob = ({ label, value, min, max, step = 1, onChange, theme }: { label: string, value: number, min: number, max: number, step?: number, onChange: (v: number) => void, theme: Theme }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <label className="text-[10px] uppercase font-bold" style={{ color: theme.textMuted }}>{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-16 md:w-20 h-2 md:h-3 rounded-lg appearance-none cursor-pointer"
        style={{ accentColor: theme.primary, backgroundColor: theme.border }}
      />
    </div>
  )
}

export default ControlPanel;