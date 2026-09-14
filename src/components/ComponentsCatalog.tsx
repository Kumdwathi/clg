import React, { useState } from 'react';
import { Search, Filter, Cpu, Zap, Shield, Eye, ArrowUpRight } from 'lucide-react';
import { BoardComponentInfo } from '../types';
import { BOARD_COMPONENTS } from '../data/componentsData';

interface ComponentsCatalogProps {
  onSelectComponent: (comp: BoardComponentInfo) => void;
  selectedComponent: BoardComponentInfo | null;
}

export const ComponentsCatalog: React.FC<ComponentsCatalogProps> = ({
  onSelectComponent,
  selectedComponent
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredComponents = BOARD_COMPONENTS.filter((comp) => {
    const matchesSearch =
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.referenceDesignator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.packageType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.roleInColdStorage.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || comp.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full bg-slate-900 rounded-2xl border border-slate-800 p-4 lg:p-6 flex flex-col gap-5">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100">
            Bill of Materials (BOM) & Component Catalog
          </h3>
          <p className="text-xs text-slate-400">
            Every circuit component, rating, pinout, and wiring specification on the controller board
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search components, pins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 text-xs font-mono pl-9 pr-3 py-2 rounded-xl border border-slate-700/80 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 font-mono text-xs">
        {['all', 'power', 'relay', 'logic', 'protection', 'display', 'sensor', 'isolation'].map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg uppercase tracking-wider text-[11px] transition ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          )
        )}
      </div>

      {/* Component Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComponents.map((comp) => {
          const isSelected = selectedComponent?.id === comp.id;
          return (
            <div
              key={comp.id}
              onClick={() => onSelectComponent(comp)}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-3 group ${
                isSelected
                  ? 'bg-sky-950/40 border-sky-400 shadow-lg shadow-sky-950/50'
                  : 'bg-slate-950 border-slate-800/80 hover:border-slate-600 hover:bg-slate-950/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-400">
                    {comp.referenceDesignator}
                  </span>
                  <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                    {comp.category}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mt-1 group-hover:text-sky-300 transition">
                  {comp.name}
                </h4>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  {comp.packageType}
                </p>

                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {comp.roleInColdStorage}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-amber-400 font-medium truncate max-w-[150px]">
                  {comp.voltageRating}
                </span>
                <span className="text-sky-400 flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  <span>Inspect in 3D</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
