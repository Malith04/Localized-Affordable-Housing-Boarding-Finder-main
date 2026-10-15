'use client';

import React, { useState } from 'react';
import { Listing } from '@/types/bodima';
import { formatLKR, generateWhatsAppLink } from '@/lib/utils/formatters';
import { CEBCalculatorModal } from '@/components/calculator/CEBCalculatorModal';
import { 
  Zap, 
  Droplets, 
  Key, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  Wifi, 
  Bath, 
  Utensils, 
  BookOpen, 
  Bed, 
  Shirt, 
  MessageCircle, 
  AlertCircle,
  X,
  Bus,
  Calculator,
  Navigation,
  ChevronRight
} from 'lucide-react';

interface UtilityBreakdownCardProps {
  listing: Listing;
  onClose?: () => void;
  isOpenModal?: boolean;
}

export const UtilityBreakdownCard: React.FC<UtilityBreakdownCardProps> = ({
  listing,
  onClose,
  isOpenModal = false,
}) => {
  const [isCEBCalcOpen, setIsCEBCalcOpen] = useState(false);
  const depositTotal = listing.monthly_rent * listing.key_money_months;
  const whatsappUrl = listing.host_phone
    ? generateWhatsAppLink({
        phone: listing.host_phone,
        hostName: listing.host_name,
        listingTitle: listing.title,
        listingId: listing.id,
      })
    : '#';

  const content = (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl max-w-xl w-full text-slate-800 dark:text-slate-100 transition-all">
      {/* Header & Verification */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Zero Hidden Fee Guarantee
            </span>
            {listing.host_is_verified ? (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" /> NIC Verified Host
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                <ShieldAlert className="w-3.5 h-3.5" /> Unverified Host
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold mt-1 line-clamp-1">{listing.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Host: <span className="font-semibold text-slate-700 dark:text-slate-200">{listing.host_name || 'Bodima Host'}</span>
            {listing.nearest_landmark && ` • Landmark: ${listing.nearest_landmark}`}
          </p>
        </div>

        {isOpenModal && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Upfront Financial Transparency Breakdown */}
      <div className="mt-5 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Financial Commitment Breakdown
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">Monthly Rent</div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              {formatLKR(listing.monthly_rent)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Due per calendar month</div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
            <div className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center justify-between">
              Key Money (Advance)
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200/60 dark:bg-amber-800/40 text-amber-800 dark:text-amber-200">
                {listing.key_money_months} {listing.key_money_months === 1 ? 'Month' : 'Months'}
              </span>
            </div>
            <div className="text-lg font-extrabold text-amber-900 dark:text-amber-200 mt-0.5">
              {formatLKR(depositTotal)}
            </div>
            <div className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
              Refundable security deposit
            </div>
          </div>
        </div>

        {/* Total Initial Move-in Cost */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50">
          <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
            Initial Total Move-in Capital Required:
          </span>
          <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
            {formatLKR(listing.monthly_rent + depositTotal)}
          </span>
        </div>
      </div>

      {/* Utility Bills Billing Policy */}
      <div className="mt-5 space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Utility Billing Terms
        </h4>

        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Electricity */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-700 dark:text-slate-200">Electricity (CEB/LECO)</div>
              <div className="text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                {listing.electricity_type === 'separate_meter' && 'Separate Sub-Meter (Pay exact units)'}
                {listing.electricity_type === 'split_bill' && 'Split Bill with Landlord'}
                {listing.electricity_type === 'included' && 'Free (Included in Rent)'}
              </div>
            </div>
          </div>

          {/* Water */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 mt-0.5">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-700 dark:text-slate-200">Water Supply (NWSDB)</div>
              <div className="text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                {listing.water_type === 'separate_meter' && 'Separate Meter Reading'}
                {listing.water_type === 'split_bill' && 'Split Monthly Bill'}
                {listing.water_type === 'included' && 'Free / Included in Rent'}
              </div>
            </div>
          </div>
        </div>

        {/* CEB Bill Calculator Quick Launch Banner */}
        <div className="mt-3 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500 text-white shadow-sm">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Estimate Exact CEB Electricity Bill
              </div>
              <div className="text-[11px] text-amber-700/80 dark:text-amber-400">
                Calculates block tariffs for laptops, fans & appliances
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCEBCalcOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm active:scale-95 transition"
          >
            <span>Calculate</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sri Lankan Bus Route & Transit Proximity Guide */}
      {listing.transit_info && (
        <div className="mt-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5 text-blue-500" />
              <span>Sri Lankan Bus & Transit Commute Guide</span>
            </h4>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
              {listing.transit_info.bus_stop_distance_meters}m to Halt
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-[11px] text-slate-400">Nearest Bus Halt:</span>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {listing.transit_info.nearest_bus_stop}
                </div>
              </div>

              {/* Bus Route Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 mr-1">Routes:</span>
                {listing.transit_info.bus_routes.map((rt) => (
                  <span
                    key={rt}
                    className="px-2 py-0.5 rounded-md font-mono font-extrabold text-xs bg-blue-600 text-white shadow-sm"
                  >
                    {rt}
                  </span>
                ))}
              </div>
            </div>

            {/* Commute Modalities Comparison */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/80 text-center text-xs">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                <div className="text-[11px] text-slate-400">🚶 Walking</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  ~{listing.transit_info.campus_commute.walk_mins} mins
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">Free</div>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                <div className="text-[11px] text-slate-400">🚌 SLTB / Private</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  ~{listing.transit_info.campus_commute.bus_mins} mins
                </div>
                <div className="text-[10px] text-blue-600 font-semibold">~Rs. 35 - 50</div>
              </div>

              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                <div className="text-[11px] text-slate-400">🛺 PickMe / Tuk</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  ~{listing.transit_info.campus_commute.tuktuk_mins} mins
                </div>
                <div className="text-[10px] text-amber-600 font-semibold">
                  ~Rs. {listing.transit_info.campus_commute.tuktuk_fare_est}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* House Rules: Curfews and Gate Access */}
      <div className="mt-5 space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Access & Curfew Rules
        </h4>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800">
            <Key className={`w-4 h-4 ${listing.has_gate_key ? 'text-emerald-500' : 'text-rose-500'}`} />
            <div>
              <div className="font-semibold text-slate-700 dark:text-slate-200">Own Gate Key</div>
              <div className="text-slate-500 dark:text-slate-400">
                {listing.has_gate_key ? 'Independent key provided' : 'Landlord locks the gate'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800">
            <Clock className={`w-4 h-4 ${listing.curfew_time ? 'text-amber-500' : 'text-emerald-500'}`} />
            <div>
              <div className="font-semibold text-slate-700 dark:text-slate-200">Night Curfew</div>
              <div className="text-slate-500 dark:text-slate-400">
                {listing.curfew_time ? `Strictly by ${listing.curfew_time}` : 'No Curfew (24/7 Access)'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities Included */}
      {listing.amenities && (
        <div className="mt-5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Included Amenities
          </h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <span className={`flex items-center gap-1.5 p-2 rounded-lg ${listing.amenities.has_wifi ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 dark:bg-slate-800/30 text-slate-400 line-through'}`}>
              <Wifi className="w-3.5 h-3.5" /> High-speed WiFi
            </span>
            <span className={`flex items-center gap-1.5 p-2 rounded-lg ${listing.amenities.has_attached_bathroom ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 dark:bg-slate-800/30 text-slate-400 line-through'}`}>
              <Bath className="w-3.5 h-3.5" /> Attached Bath
            </span>
            <span className={`flex items-center gap-1.5 p-2 rounded-lg ${listing.amenities.cooking_allowed ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 dark:bg-slate-800/30 text-slate-400 line-through'}`}>
              <Utensils className="w-3.5 h-3.5" /> Cooking Allowed
            </span>
            <span className={`flex items-center gap-1.5 p-2 rounded-lg ${listing.amenities.has_study_table ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 dark:bg-slate-800/30 text-slate-400 line-through'}`}>
              <BookOpen className="w-3.5 h-3.5" /> Study Table
            </span>
            <span className={`flex items-center gap-1.5 p-2 rounded-lg ${listing.amenities.has_bed_and_mattress ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 dark:bg-slate-800/30 text-slate-400 line-through'}`}>
              <Bed className="w-3.5 h-3.5" /> Bed & Mattress
            </span>
            <span className={`flex items-center gap-1.5 p-2 rounded-lg ${listing.amenities.has_washing_machine ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 dark:bg-slate-800/30 text-slate-400 line-through'}`}>
              <Shirt className="w-3.5 h-3.5" /> Washing Machine
            </span>
          </div>
        </div>
      )}

      {/* Safety Note */}
      <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
        <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <span>
          <strong>Bodima Student Advisory:</strong> Never transfer key money prior to inspecting the physical room and meeting the verified landlord in person.
        </span>
      </div>

      {/* Direct Contact Button */}
      <div className="mt-5">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          Inquire Direct on WhatsApp ({listing.host_phone || 'Host'})
        </a>
      </div>
    </div>
  );

  return (
    <>
      {isOpenModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] overflow-y-auto">
            {content}
          </div>
        </div>
      ) : (
        content
      )}

      {/* Embedded CEB Electricity Calculator Modal */}
      <CEBCalculatorModal
        isOpen={isCEBCalcOpen}
        onClose={() => setIsCEBCalcOpen(false)}
        monthlyRentHint={listing.monthly_rent}
      />
    </>
  );
};
