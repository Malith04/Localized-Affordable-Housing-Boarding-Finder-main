'use client';

import React, { useState } from 'react';
import { SRI_LANKAN_UNIVERSITIES } from '@/lib/constants/universities';
import { UniversityAnchor, CampusGate } from '@/types/bodima';
import { GraduationCap, MapPin, Navigation, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface UniversityQuickBarProps {
  selectedUniversity: UniversityAnchor;
  onSelectUniversity: (uni: UniversityAnchor) => void;
  selectedGate?: CampusGate | null;
  onSelectGate?: (gate: CampusGate) => void;
}

export const UniversityQuickBar: React.FC<UniversityQuickBarProps> = ({
  selectedUniversity,
  onSelectUniversity,
  selectedGate,
  onSelectGate,
}) => {
  // Collapsible state: compact by default to keep the screen clean and spacious
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all overflow-hidden">
      {/* Compact Summary Strip (Always Visible) */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Destination & Gate Summary */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Selected Zone:</span>
            <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{selectedUniversity.shortName}</span>
              <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400">
                ({selectedUniversity.city})
              </span>
            </span>

            {selectedGate && (
              <>
                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-[11px]">
                  <Navigation className="w-3 h-3 text-emerald-500" />
                  <span>{selectedGate.name}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Expand / Collapse Toggle Button */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden md:inline">
            7 Regional Hubs in Kandy
          </span>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isExpanded
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span>{isExpanded ? 'Hide Kandy Hubs' : 'Change Kandy Zone / Gate (7 Areas)'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Dropdown Content: 7 Kandy Hubs & Entrance Gates */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>Select a Kandy Academic, Healthcare or Industrial Corridor:</span>
            <span className="text-emerald-600 dark:text-emerald-400 normal-case font-medium">
              Click any hub to recalculate perimeter
            </span>
          </div>

          {/* 7 Kandy Hub Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
            {SRI_LANKAN_UNIVERSITIES.map((uni) => {
              const isActive = selectedUniversity.id === uni.id;
              return (
                <button
                  key={uni.id}
                  onClick={() => onSelectUniversity(uni)}
                  className={`flex flex-col text-left px-3 py-2 rounded-xl text-xs transition-all border ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20 font-bold scale-[1.01]'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-emerald-400 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="font-bold truncate">{uni.shortName}</span>
                  <span className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    {uni.city}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Specific Gate Selector Sub-Bar */}
          {selectedUniversity.gates && selectedUniversity.gates.length > 0 && (
            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                <span>Specific Entrance Gate / Focus Hub (නැවතුම් දොරටුව):</span>
                <span className="text-[11px] font-normal text-slate-400 hidden sm:inline">
                  Walking distances calculated from this faculty entrance
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {selectedUniversity.gates.map((gate) => {
                  const isGateActive = selectedGate?.id === gate.id;
                  return (
                    <button
                      key={gate.id}
                      type="button"
                      onClick={() => onSelectGate?.(gate)}
                      className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 border ${
                        isGateActive
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30 font-bold shadow-sm'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:bg-slate-50'
                      }`}
                      title={`${gate.name} (${gate.facultiesNearby})`}
                    >
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${isGateActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                      <span className="font-semibold">{gate.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal hidden md:inline">
                        • {gate.facultiesNearby.split(',')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
