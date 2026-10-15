'use client';

import React, { useState, useMemo } from 'react';
import { 
  DEFAULT_STUDENT_APPLIANCES, 
  calculateCEBBill 
} from '@/lib/utils/cebTariff';
import { CEBApplianceItem } from '@/types/bodima';
import { formatLKR } from '@/lib/utils/formatters';
import {
  Zap,
  Users,
  Info,
  ShieldCheck,
  X,
  RotateCcw,
  Sliders,
  Laptop,
  Fan,
  Lightbulb,
  Coffee,
  Refrigerator,
  Shirt,
  Utensils,
  Flame,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface CEBCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyRentHint?: number;
}

export const CEBCalculatorModal: React.FC<CEBCalculatorModalProps> = ({
  isOpen,
  onClose,
  monthlyRentHint,
}) => {
  const [appliances, setAppliances] = useState<CEBApplianceItem[]>(DEFAULT_STUDENT_APPLIANCES);
  const [roommatesCount, setRoommatesCount] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'appliances' | 'manual'>('appliances');
  const [manualUnits, setManualUnits] = useState<number>(45);

  // Calculate units from appliances
  const calculatedUnitsFromAppliances = useMemo(() => {
    return appliances.reduce((sum, item) => sum + item.quantity * item.unitsPerMonth, 0);
  }, [appliances]);

  const activeUnits = activeTab === 'appliances' ? calculatedUnitsFromAppliances : manualUnits;
  const billCalc = useMemo(() => calculateCEBBill(activeUnits), [activeUnits]);
  const perPersonShare = Math.round(billCalc.totalMonthlyBill / roommatesCount);

  // Total living cost estimate (Rent + Bill share)
  const totalLivingCost = monthlyRentHint ? monthlyRentHint + perPersonShare : null;

  const handleQuantityChange = (id: string, delta: number) => {
    setAppliances((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, Math.min(6, item.quantity + delta));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleReset = () => {
    setAppliances(DEFAULT_STUDENT_APPLIANCES);
    setManualUnits(45);
    setRoommatesCount(1);
  };

  const renderIcon = (iconName: string) => {
    const props = { className: 'w-4 h-4' };
    switch (iconName) {
      case 'Laptop': return <Laptop {...props} />;
      case 'Fan': return <Fan {...props} />;
      case 'Lightbulb': return <Lightbulb {...props} />;
      case 'Coffee': return <Coffee {...props} />;
      case 'Refrigerator': return <Refrigerator {...props} />;
      case 'Shirt': return <Shirt {...props} />;
      case 'Utensils': return <Utensils {...props} />;
      case 'Flame': return <Flame {...props} />;
      default: return <Zap {...props} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col text-slate-800 dark:text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  CEB Domestic Electricity & Living Cost Calculator
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  ශ්‍රී ලංකා CEB
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Accurate domestic block tariff rates • Eliminate landlord utility fee conflicts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close calculator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Top Calculation Mode Tabs */}
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('appliances')}
                className={`px-3.5 py-1.5 rounded-xl transition ${
                  activeTab === 'appliances'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Appliance Estimator (උපකරණ මඟින්)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`px-3.5 py-1.5 rounded-xl transition ${
                  activeTab === 'manual'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Direct Units Slider (ඒකක ගණන)
              </button>
            </div>

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition"
              title="Reset defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Mode 1: Appliance Counters */}
          {activeTab === 'appliances' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Select appliances used in your room:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {calculatedUnitsFromAppliances} kWh/month estimated
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {appliances.map((app) => (
                  <div
                    key={app.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      app.quantity > 0
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/60 dark:border-emerald-800/60 shadow-sm'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        app.quantity > 0 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}>
                        {renderIcon(app.iconName)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {app.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {app.sinhalaName} • ~{app.unitsPerMonth} units/mo
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(app.id, -1)}
                        disabled={app.quantity === 0}
                        className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-sm flex items-center justify-center transition"
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-xs font-extrabold text-slate-900 dark:text-white">
                        {app.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(app.id, 1)}
                        className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center transition shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mode 2: Direct Units Slider */}
          {activeTab === 'manual' && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Sub-Meter Monthly Consumption:
                </span>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {manualUnits} <span className="text-xs font-semibold text-slate-400">kWh (Units)</span>
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="250"
                step="5"
                value={manualUnits}
                onChange={(e) => setManualUnits(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0 units (Vacant)</span>
                <span>30 (Low)</span>
                <span>60 (Subsidized Cutoff)</span>
                <span>120 (Standard)</span>
                <span>180+ (High)</span>
              </div>
            </div>
          )}

          {/* Roommate Splitter Selection */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Roommate Bill Splitter (සහවාසිකයන් බෙදාගැනීම)
                </div>
                <div className="text-[11px] text-slate-400">
                  Divide bill equally among tenants sharing this sub-meter
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              {[1, 2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setRoommatesCount(count)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    roommatesCount === count
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {count} {count === 1 ? 'Solo' : `${count} People`}
                </button>
              ))}
            </div>
          </div>

          {/* CEB Bill Output Hero Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Official CEB Tariff Calculation
                </span>
                <div className="text-sm font-semibold text-slate-300 mt-0.5">
                  {billCalc.tierName} • {billCalc.tierSinhala}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] text-slate-400">Total Month Units</div>
                <div className="text-lg font-black text-amber-300">{billCalc.totalUnits} Units</div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-slate-400 text-[11px]">Energy Charges</div>
                <div className="text-base font-bold text-white mt-0.5">
                  {formatLKR(billCalc.unitCostTotal)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Usage units cost</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-slate-400 text-[11px]">CEB Fixed Charge</div>
                <div className="text-base font-bold text-white mt-0.5">
                  {formatLKR(billCalc.fixedCharge)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Monthly customer charge</div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-slate-400 text-[11px]">Effective Unit Rate</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">
                  Rs. {billCalc.effectiveRatePerUnit}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Average cost per kWh</div>
              </div>
            </div>

            {/* Big Total Bill & Share */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10">
              <div>
                <span className="text-xs text-slate-400">Total Meter Bill (100%):</span>
                <div className="text-2xl font-black text-white">
                  {formatLKR(billCalc.totalMonthlyBill)}
                  <span className="text-xs font-normal text-slate-400 ml-1">/ month</span>
                </div>
              </div>

              {roommatesCount > 1 && (
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-right">
                  <span className="text-[11px] font-bold text-emerald-300">
                    Your Split Share ({roommatesCount} tenants):
                  </span>
                  <div className="text-2xl font-black text-emerald-400">
                    {formatLKR(perPersonShare)}
                    <span className="text-xs font-normal text-white/70 ml-1">/ person</span>
                  </div>
                </div>
              )}
            </div>

            {/* Estimated Total Living Cost (Rent + Power Share) */}
            {totalLivingCost && (
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-300">Total True Monthly Living Cost:</span>
                  <div className="text-[11px] text-slate-400">Rent ({formatLKR(monthlyRentHint || 0)}) + Power Split ({formatLKR(perPersonShare)})</div>
                </div>
                <div className="text-lg font-extrabold text-emerald-300">
                  {formatLKR(totalLivingCost)} / mo
                </div>
              </div>
            )}
          </div>

          {/* Legal / Student Protection Advisory */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Public Utilities Commission of Sri Lanka (PUCSL) Student Advisory:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
              <li>Landlords cannot legally charge arbitrary flat rates (e.g., Rs. 50/unit) on separate meters.</li>
              <li>Always take a photo of the initial sub-meter reading on your move-in date.</li>
              <li>Keep total monthly usage under 60 units whenever possible to enjoy government subsidized rates.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            CEB Block Tariff Database • Updated 2026
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
