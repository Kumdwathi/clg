import React from 'react';
import {
  Sun,
  Battery,
  Wind,
  Droplets,
  Thermometer,
  Zap,
  Activity,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  DoorOpen
} from 'lucide-react';
import { CropPreset, SimulationState } from '../types';
import { CROP_PRESETS } from '../data/componentsData';

interface SimulationPanelProps {
  simState: SimulationState;
  onUpdateSim: (updates: Partial<SimulationState>) => void;
  onReset: () => void;
  onSelectCrop: (crop: CropPreset) => void;
  selectedCrop: CropPreset;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  simState,
  onUpdateSim,
  onReset,
  onSelectCrop,
  selectedCrop
}) => {
  return (
    <div className="w-full bg-slate-900 rounded-2xl border border-slate-800 p-4 lg:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
              REAL-TIME SIMULATOR
            </span>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ESP32 FIRMWARE PID LOOP ACTIVE</span>
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-100 mt-1">
            Climate & Solar Simulation Engine
          </h3>
          <p className="text-xs text-slate-400">
            Adjust hill climate parameters to observe automated optocoupler firing, relay clicks, and OLED telemetry updates
          </p>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 transition self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Simulation</span>
        </button>
      </div>

      {/* Interactive Controls & Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Control 1: Cold Storage Room Temp */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-sky-400" />
                <span>Cold Room Temp</span>
              </span>
              <span className="font-bold text-sky-400 text-sm">
                {simState.coldRoomTemp.toFixed(1)}°C
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              Target for {selectedCrop.name.split(' ')[0]}: {selectedCrop.targetTemp}°C
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="25"
            step="0.5"
            value={simState.coldRoomTemp}
            onChange={(e) => onUpdateSim({ coldRoomTemp: parseFloat(e.target.value) })}
            className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>0°C (Near Freezing)</span>
            <span>25°C (Ambient)</span>
          </div>
        </div>

        {/* Control 2: Relative Humidity */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>Relative Humidity</span>
              </span>
              <span className="font-bold text-cyan-400 text-sm">
                {Math.round(simState.humidity)}% RH
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              Optimal: {selectedCrop.targetHumidity}% (Preserves Crop Weight)
            </div>
          </div>

          <input
            type="range"
            min="40"
            max="100"
            step="1"
            value={simState.humidity}
            onChange={(e) => onUpdateSim({ humidity: parseInt(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>40% (Dry/Shriveling)</span>
            <span>100% (Saturated)</span>
          </div>
        </div>

        {/* Control 3: Solar Radiation (W/m2) */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Solar Irradiance</span>
              </span>
              <span className="font-bold text-amber-400 text-sm">
                {simState.solarIrradiance} W/m²
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              {simState.solarIrradiance > 500
                ? 'Sunny Mountain Sun (Optimal Harvest)'
                : 'Overcast / Monsoon Monsoon Rain'}
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="1000"
            step="50"
            value={simState.solarIrradiance}
            onChange={(e) => onUpdateSim({ solarIrradiance: parseInt(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>0 W/m² (Night)</span>
            <span>1000 W/m² (Peak)</span>
          </div>
        </div>

        {/* Control 4: Farm Hardware Interlocks */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-2 text-xs font-mono">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider block">
            Sensor Interlocks
          </span>

          <button
            onClick={() => onUpdateSim({ waterReservoirOk: !simState.waterReservoirOk })}
            className={`p-2 rounded-lg flex items-center justify-between transition border ${
              simState.waterReservoirOk
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                : 'bg-rose-950/40 text-rose-300 border-rose-800/60'
            }`}
          >
            <span className="flex items-center gap-1.5 text-[11px]">
              <Droplets className="w-3.5 h-3.5" />
              <span>Water Float Tank</span>
            </span>
            <span className="text-[10px] font-bold">
              {simState.waterReservoirOk ? 'OK' : 'EMPTY (LOCK)'}
            </span>
          </button>

          <button
            onClick={() => onUpdateSim({ doorOpen: !simState.doorOpen })}
            className={`p-2 rounded-lg flex items-center justify-between transition border ${
              !simState.doorOpen
                ? 'bg-slate-900 text-slate-300 border-slate-800'
                : 'bg-amber-950/40 text-amber-300 border-amber-800/60'
            }`}
          >
            <span className="flex items-center gap-1.5 text-[11px]">
              <DoorOpen className="w-3.5 h-3.5" />
              <span>Chamber Door</span>
            </span>
            <span className="text-[10px] font-bold">
              {simState.doorOpen ? 'OPEN (LEAK)' : 'SEALED'}
            </span>
          </button>
        </div>
      </div>

      {/* Automated Relay Firing Indicators (Real-time Status matching PCB LEDs) */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3 font-mono">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="uppercase font-bold text-slate-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>ESP32 Real-Time Relay Actuation States (PC817 Opto-Isolated)</span>
          </span>
          <span className="text-[11px] text-sky-400">Firmware Decision Matrix</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Relay 1: AC Chiller */}
          <div
            className={`p-3 rounded-xl border transition flex flex-col justify-between ${
              simState.acUnitActive
                ? 'bg-sky-950/40 border-sky-500/60 text-sky-300 shadow-md shadow-sky-950/50'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold">RL1 (TB3)</span>
              <div
                className={`w-2 h-2 rounded-full ${
                  simState.acUnitActive ? 'bg-sky-400 animate-ping' : 'bg-slate-700'
                }`}
              />
            </div>
            <div className="text-sm font-bold text-white mt-1">AC Chiller</div>
            <div className="text-[10px] mt-1">
              {simState.acUnitActive ? 'COMPRESSOR ACTIVE' : 'TEMP REACHED (IDLE)'}
            </div>
          </div>

          {/* Relay 2: Exhaust Fan */}
          <div
            className={`p-3 rounded-xl border transition flex flex-col justify-between ${
              simState.fanActive
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-950/50'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold">RL2 (TB4)</span>
              <div
                className={`w-2 h-2 rounded-full ${
                  simState.fanActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-700'
                }`}
              />
            </div>
            <div className="text-sm font-bold text-white mt-1">Exhaust Fan</div>
            <div className="text-[10px] mt-1">
              {simState.fanActive ? 'VENTILATING (HIGH CFM)' : 'STANDBY'}
            </div>
          </div>

          {/* Relay 3: Fogger Pump */}
          <div
            className={`p-3 rounded-xl border transition flex flex-col justify-between ${
              simState.foggerActive
                ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-950/50'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold">RL3 (TB5)</span>
              <div
                className={`w-2 h-2 rounded-full ${
                  simState.foggerActive ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'
                }`}
              />
            </div>
            <div className="text-sm font-bold text-white mt-1">Fogger Pump</div>
            <div className="text-[10px] mt-1">
              {simState.foggerActive ? 'MISTING (90% RH)' : 'HUMIDITY MET'}
            </div>
          </div>

          {/* Relay 4: Auxiliary */}
          <div
            className={`p-3 rounded-xl border transition flex flex-col justify-between ${
              simState.auxActive
                ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 shadow-md shadow-amber-950/50'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold">RL4 (AUX)</span>
              <div
                className={`w-2 h-2 rounded-full ${
                  simState.auxActive ? 'bg-amber-400' : 'bg-slate-700'
                }`}
              />
            </div>
            <div className="text-sm font-bold text-white mt-1">Defrost / Aux</div>
            <div className="text-[10px] mt-1">
              {simState.auxActive ? 'DEFROST CYCLE' : 'OFF'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
