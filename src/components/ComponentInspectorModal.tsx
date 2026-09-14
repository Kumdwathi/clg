import React from 'react';
import { X, ExternalLink, Zap, Shield, HelpCircle, ChevronRight, ChevronLeft, Cpu } from 'lucide-react';
import { BoardComponentInfo } from '../types';
import { BOARD_COMPONENTS } from '../data/componentsData';

interface ComponentInspectorModalProps {
  component: BoardComponentInfo | null;
  onClose: () => void;
  onSelectComponent: (component: BoardComponentInfo) => void;
}

export const ComponentInspectorModal: React.FC<ComponentInspectorModalProps> = ({
  component,
  onClose,
  onSelectComponent
}) => {
  if (!component) return null;

  const currentIndex = BOARD_COMPONENTS.findIndex((c) => c.id === component.id);
  const prevComponent = BOARD_COMPONENTS[(currentIndex - 1 + BOARD_COMPONENTS.length) % BOARD_COMPONENTS.length];
  const nextComponent = BOARD_COMPONENTS[(currentIndex + 1) % BOARD_COMPONENTS.length];

  const categoryColor = {
    power: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
    relay: 'text-sky-400 bg-sky-950/60 border-sky-800/60',
    logic: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
    sensor: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
    protection: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
    display: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60',
    isolation: 'text-yellow-400 bg-yellow-950/60 border-yellow-800/60'
  }[component.category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border uppercase ${categoryColor}`}>
              {component.category}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-sky-400">
                  {component.referenceDesignator}
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs font-mono text-slate-400">
                  {component.packageType}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {component.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 lg:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Key Electrical Specs Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Voltage Rating
              </span>
              <span className="text-xs font-mono font-bold text-sky-400 mt-1 block">
                {component.voltageRating}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Current Rating
              </span>
              <span className="text-xs font-mono font-bold text-amber-400 mt-1 block">
                {component.currentRating}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Schematic Node
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 mt-1 block truncate">
                {component.schematicNode}
              </span>
            </div>
          </div>

          {/* Role in Cold Storage */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>Role in Cold Storage Architecture</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              {component.roleInColdStorage}
            </p>
          </div>

          {/* North Eastern Farmer Benefit */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rural Farm Reliability & Farmer Value</span>
            </h4>
            <p className="text-xs text-emerald-300/90 leading-relaxed bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/40">
              {component.neFarmerBenefit}
            </p>
          </div>

          {/* Specifications Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Technical Datasheet Specifications
            </h4>
            <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800/60 font-mono text-xs">
              {Object.entries(component.specifications).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between px-3.5 py-2">
                  <span className="text-slate-400 text-[11px]">{key}</span>
                  <span className="text-slate-200 text-[11px] font-semibold">{val}</span>
                </div>
              ))}
              {component.wiringAWG && (
                <div className="flex items-center justify-between px-3.5 py-2 bg-sky-950/20">
                  <span className="text-sky-400 text-[11px]">Recommended Wiring</span>
                  <span className="text-sky-300 text-[11px] font-bold">{component.wiringAWG}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectComponent(prevComponent)}
              className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev: {prevComponent.referenceDesignator}</span>
            </button>
            <button
              onClick={() => onSelectComponent(nextComponent)}
              className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 transition"
            >
              <span className="hidden sm:inline">Next: {nextComponent.referenceDesignator}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-mono font-bold px-4 py-2 rounded-xl transition shadow-md"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
