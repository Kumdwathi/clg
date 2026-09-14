/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Video,
  Layers,
  Home,
  Sliders,
  FileText,
  Cpu,
  Zap,
  Sun,
  Droplets,
  Thermometer,
  ShieldCheck,
  Download,
  Info,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { PCB3DViewer } from './components/PCB3DViewer';
import { SchematicView } from './components/SchematicView';
import { ColdStorageShedView } from './components/ColdStorageShedView';
import { ComponentsCatalog } from './components/ComponentsCatalog';
import { SimulationPanel } from './components/SimulationPanel';
import { ComponentInspectorModal } from './components/ComponentInspectorModal';
import { BoardComponentInfo, CropPreset, SimulationState } from './types';
import { BOARD_COMPONENTS, CROP_PRESETS } from './data/componentsData';

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'viewer' | 'schematic' | 'shed' | 'catalog' | 'simulation'
  >('viewer');

  // Selected Component for detailed inspection
  const [selectedComponent, setSelectedComponent] = useState<BoardComponentInfo | null>(null);

  // Selected Horticultural Crop preset for North Eastern farmer
  const [selectedCrop, setSelectedCrop] = useState<CropPreset>(CROP_PRESETS[0]); // Nadia Ginger

  // Environmental & Electrical Simulation State
  const [simState, setSimState] = useState<SimulationState>({
    ambientTemp: 28.5, // 28.5°C outside in Assam/Meghalaya foothills
    coldRoomTemp: 12.0, // °C current cold storage chamber
    humidity: 90, // % RH
    solarIrradiance: 750, // W/m2 bright sunlight
    batteryVoltage: 13.4, // V
    waterReservoirOk: true,
    acUnitActive: true,
    fanActive: true,
    foggerActive: true,
    auxActive: false,
    doorOpen: false,
    selectedCrop: 'ginger'
  });

  // Automated PID logic loop based on sensor telemetry vs target crop presets
  useEffect(() => {
    const isCoolingNeeded = simState.coldRoomTemp > selectedCrop.targetTemp;
    const isMistingNeeded = simState.humidity < selectedCrop.targetHumidity && simState.waterReservoirOk;
    const isFanNeeded = simState.coldRoomTemp > selectedCrop.targetTemp + 1.5 || simState.doorOpen;

    // Estimate battery voltage based on solar irradiance
    const estimatedBattVolt = 12.0 + (simState.solarIrradiance / 1000) * 1.6;

    setSimState((prev) => ({
      ...prev,
      acUnitActive: isCoolingNeeded,
      foggerActive: isMistingNeeded,
      fanActive: isFanNeeded,
      batteryVoltage: Number(estimatedBattVolt.toFixed(1))
    }));
  }, [
    simState.coldRoomTemp,
    simState.humidity,
    simState.solarIrradiance,
    simState.waterReservoirOk,
    simState.doorOpen,
    selectedCrop
  ]);

  const handleUpdateSim = (updates: Partial<SimulationState>) => {
    setSimState((prev) => ({ ...prev, ...updates }));
  };

  const handleResetSim = () => {
    setSimState({
      ambientTemp: 28.5,
      coldRoomTemp: selectedCrop.targetTemp,
      humidity: selectedCrop.targetHumidity,
      solarIrradiance: 750,
      batteryVoltage: 13.4,
      waterReservoirOk: true,
      acUnitActive: false,
      fanActive: false,
      foggerActive: false,
      auxActive: false,
      doorOpen: false,
      selectedCrop: selectedCrop.id as any
    });
  };

  const handleSelectCrop = (crop: CropPreset) => {
    setSelectedCrop(crop);
    setSimState((prev) => ({
      ...prev,
      coldRoomTemp: crop.targetTemp,
      humidity: crop.targetHumidity,
      selectedCrop: crop.id as any
    }));
  };

  const handleSelectComponent = (comp: BoardComponentInfo) => {
    setSelectedComponent(comp);
    // If in catalog or schematic, bring viewer to foreground if desired
  };

  // Telemetry bundle for real-time 3D OLED screen
  const telemetryData = useMemo(() => {
    return {
      temp: simState.coldRoomTemp,
      humidity: simState.humidity,
      batteryVoltage: simState.batteryVoltage,
      solarVoltage: simState.solarIrradiance > 100 ? 14.4 : 11.2,
      acActive: simState.acUnitActive,
      fanActive: simState.fanActive,
      foggerActive: simState.foggerActive,
      cropName: selectedCrop.name.split(' ')[0]
    };
  }, [simState, selectedCrop]);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-sky-500 selection:text-white">
      {/* Top Main Navigation Bar */}
      <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 lg:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Hardware Project Title */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-emerald-500 p-0.5 shadow-lg shadow-sky-950">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-sky-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm lg:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>Solar Cold Storage PCB Model</span>
                  <span className="text-[10px] font-mono bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded border border-sky-400/30">
                    4K ULTRA-HD
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Off-Grid Horticultural Preservation Controller • North-Eastern Region Farmers
              </p>
            </div>
          </div>

          {/* Navigation Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono w-full sm:w-auto overflow-x-auto scrollbar-none">
            {[
              { id: 'viewer', label: '3D 4K Video Tour', icon: Video },
              { id: 'schematic', label: 'Schematic', icon: Layers },
              { id: 'shed', label: 'Cold Storage Shed', icon: Home },
              { id: 'catalog', label: 'Components BOM', icon: FileText },
              { id: 'simulation', label: 'Live Simulator', icon: Sliders }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                    isActive
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 lg:p-6 flex flex-col gap-6">
        {/* Render Tab Views */}
        {activeTab === 'viewer' && (
          <div className="w-full flex-1 min-h-[600px] h-[78vh] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative flex flex-col">
            <PCB3DViewer
              onSelectComponent={handleSelectComponent}
              selectedComponent={selectedComponent}
              telemetry={telemetryData}
            />
          </div>
        )}

        {activeTab === 'schematic' && (
          <div className="w-full animate-fadeIn">
            <SchematicView
              onSelectComponentById={(id) => {
                const found = BOARD_COMPONENTS.find((c) => c.id === id);
                if (found) handleSelectComponent(found);
              }}
            />
          </div>
        )}

        {activeTab === 'shed' && (
          <div className="w-full animate-fadeIn">
            <ColdStorageShedView
              currentTemp={simState.coldRoomTemp}
              currentHumidity={simState.humidity}
              batteryVoltage={simState.batteryVoltage}
              acActive={simState.acUnitActive}
              fanActive={simState.fanActive}
              foggerActive={simState.foggerActive}
              selectedCrop={selectedCrop}
              onSelectCrop={handleSelectCrop}
            />
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="w-full animate-fadeIn">
            <ComponentsCatalog
              onSelectComponent={(comp) => {
                handleSelectComponent(comp);
                // Switch to 3D viewer to highlight
                setActiveTab('viewer');
              }}
              selectedComponent={selectedComponent}
            />
          </div>
        )}

        {activeTab === 'simulation' && (
          <div className="w-full animate-fadeIn">
            <SimulationPanel
              simState={simState}
              onUpdateSim={handleUpdateSim}
              onReset={handleResetSim}
              onSelectCrop={handleSelectCrop}
              selectedCrop={selectedCrop}
            />
          </div>
        )}

        {/* Quick Reference Summary Bar for Farmers & Circuit Designers */}
        <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Harvesting Power</div>
              <div className="text-slate-200 font-bold">12V/24V PV Array</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Safety Barrier</div>
              <div className="text-slate-200 font-bold">3.5mm Galvanic Slot</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Humidity Guard</div>
              <div className="text-slate-200 font-bold">85-95% Fogger Misting</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Microcontroller</div>
              <div className="text-slate-200 font-bold">ESP32 Dual-Core LX6</div>
            </div>
          </div>
        </div>
      </main>

      {/* Component Inspector Modal when a component is clicked */}
      <ComponentInspectorModal
        component={selectedComponent}
        onClose={() => setSelectedComponent(null)}
        onSelectComponent={setSelectedComponent}
      />
    </div>
  );
}
