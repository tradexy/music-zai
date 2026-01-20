import React, { useEffect, useRef } from 'react';
import { MidiMessageLog, MidiDevice } from '../types';
import { Activity, Radio } from 'lucide-react';

interface MidiMonitorProps {
  logs: MidiMessageLog[];
  devices: MidiDevice[];
  selectedDevice: string | null;
  onSelectDevice: (id: string) => void;
  channel: number;
  onSetChannel: (ch: number) => void;
}

const MidiMonitor: React.FC<MidiMonitorProps> = ({ logs, devices, selectedDevice, onSelectDevice, channel, onSetChannel }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-zinc-900 border-l border-zinc-800 w-80 flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900">
        <h2 className="text-zinc-100 font-bold flex items-center gap-2">
          <Activity size={18} className="text-emerald-500" />
          Hardware I/O
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Phase 1: Debugging & Integration</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Device Select */}
        <div>
          <label className="text-xs text-zinc-400 uppercase font-bold block mb-2">MIDI Output Device</label>
          <select 
            className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-sm rounded p-2 focus:ring-1 focus:ring-emerald-500 outline-none"
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
           <label className="text-xs text-zinc-400 uppercase font-bold block mb-2">Channel</label>
           <div className="flex items-center gap-2">
             <input 
                type="number" 
                min="1" 
                max="16" 
                value={channel + 1}
                onChange={(e) => onSetChannel(parseInt(e.target.value) - 1)}
                className="w-16 bg-zinc-950 border border-zinc-700 text-zinc-200 text-sm rounded p-2 text-center"
             />
             <span className="text-xs text-zinc-600">Phase 1.1: Verify Channel</span>
           </div>
        </div>
      </div>

      {/* Visual Monitor */}
      <div className="flex-1 flex flex-col min-h-0 border-t border-zinc-800">
         <div className="p-2 bg-zinc-950/50 flex justify-between items-center">
            <span className="text-xs font-mono text-zinc-500">MIDI EVENT LOG</span>
            <div className={`w-2 h-2 rounded-full ${logs.length > 0 && Date.now() - logs[logs.length-1].timestamp < 200 ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-800'}`}></div>
         </div>
         <div 
            ref={logContainerRef}
            className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1 bg-zinc-950"
         >
            {logs.length === 0 && <span className="text-zinc-700 italic">No events sent yet...</span>}
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2 text-zinc-400 hover:text-zinc-200">
                <span className="text-zinc-600">[{new Date(log.timestamp).toLocaleTimeString().split(' ')[0]}]</span>
                <span className={log.description.includes('On') ? 'text-emerald-500' : 'text-rose-500'}>
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
