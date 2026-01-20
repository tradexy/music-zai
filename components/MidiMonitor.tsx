import React, { useEffect, useRef } from 'react';
import { MidiMessageLog, MidiDevice, Theme } from '../types';
import { Activity } from 'lucide-react';

interface MidiMonitorProps {
  logs: MidiMessageLog[];
  devices: MidiDevice[];
  selectedDevice: string | null;
  onSelectDevice: (id: string) => void;
  channel: number;
  onSetChannel: (ch: number) => void;
  theme: Theme;
}

const MidiMonitor: React.FC<MidiMonitorProps> = ({ logs, devices, selectedDevice, onSelectDevice, channel, onSetChannel, theme }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      className="border-l lg:w-80 flex flex-col lg:h-full"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <div className="p-4 border-b" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
        <h2 className="font-bold flex items-center gap-2" style={{ color: theme.text }}>
          <Activity size={18} style={{ color: theme.primary }} />
          Hardware I/O
        </h2>
        <p className="text-xs mt-1" style={{ color: theme.textMuted }}>MIDI Integration</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Device Select */}
        <div>
          <label className="text-xs uppercase font-bold block mb-2" style={{ color: theme.textMuted }}>MIDI Output Device</label>
          <select
            className="w-full border text-sm rounded p-2 outline-none"
            style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.text }}
            value={selectedDevice || ''}
            onChange={(e) => onSelectDevice(e.target.value)}
          >
            <option value="">Select Output...</option>
            {devices.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Channel Select */}
        <div>
          <label className="text-xs uppercase font-bold block mb-2" style={{ color: theme.textMuted }}>Channel</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="16"
              value={channel + 1}
              onChange={(e) => onSetChannel(parseInt(e.target.value) - 1)}
              className="w-16 border text-sm rounded p-2 text-center"
              style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.text }}
            />
            <span className="text-xs" style={{ color: theme.textMuted }}>1-16</span>
          </div>
        </div>
      </div>

      {/* Visual Monitor */}
      <div className="flex-1 flex flex-col min-h-0 border-t max-h-60 lg:max-h-none" style={{ borderColor: theme.border }}>
        <div className="p-2 flex justify-between items-center" style={{ backgroundColor: `${theme.background}88` }}>
          <span className="text-xs font-mono" style={{ color: theme.textMuted }}>MIDI EVENT LOG</span>
          <div
            className={`w-2 h-2 rounded-full ${logs.length > 0 && Date.now() - logs[logs.length - 1].timestamp < 200 ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: logs.length > 0 && Date.now() - logs[logs.length - 1].timestamp < 200 ? theme.primary : theme.border }}
          ></div>
        </div>
        <div
          ref={logContainerRef}
          className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1"
          style={{ backgroundColor: theme.background }}
        >
          {logs.length === 0 && <span className="italic" style={{ color: theme.textMuted }}>No events sent yet...</span>}
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2" style={{ color: theme.textMuted }}>
              <span style={{ color: theme.textMuted }}>[{new Date(log.timestamp).toLocaleTimeString().split(' ')[0]}]</span>
              <span style={{ color: log.description.includes('On') ? theme.primary : '#f43f5e' }}>
                {log.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MidiMonitor;
