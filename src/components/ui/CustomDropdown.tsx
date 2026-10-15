'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption<T = string | number> {
  label: string;
  value: T;
  icon?: React.ReactNode;
  subtitle?: string;
}

interface CustomDropdownProps<T = string | number> {
  labelPrefix?: string;
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  icon?: React.ReactNode;
  className?: string;
}

export function CustomDropdown<T = string | number>({
  labelPrefix,
  options,
  value,
  onChange,
  icon,
  className = '',
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 ${
          isOpen
            ? 'bg-slate-100 dark:bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900 dark:text-white'
            : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm'
        }`}
      >
        {icon && <span className="text-emerald-500 dark:text-emerald-400">{icon}</span>}
        
        {labelPrefix && (
          <span className="text-slate-400 dark:text-slate-500 font-normal">{labelPrefix}:</span>
        )}

        <span className="font-bold text-slate-800 dark:text-slate-100">
          {selectedOption ? selectedOption.label : 'Select'}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-500' : ''
          }`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 min-w-[200px] w-max z-50 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 backdrop-blur-lg animate-in fade-in zoom-in-95 duration-150">
          <div className="space-y-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <div>
                      <div>{option.label}</div>
                      {option.subtitle && (
                        <div className="text-[10px] text-slate-400 font-normal">{option.subtitle}</div>
                      )}
                    </div>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
