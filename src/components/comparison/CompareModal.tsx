'use client';

import React from 'react';
import Image from 'next/image';
import { Listing } from '@/types/bodima';
import { formatLKR, formatDistanceAndWalkTime, generateWhatsAppLink, generateParentShareWhatsAppLink } from '@/lib/utils/formatters';
import {
  X,
  Scale,
  Check,
  Zap,
  Droplets,
  Key,
  Clock,
  Bus,
  ShieldCheck,
  ShieldAlert,
  MessageCircle,
  Share2,
  Trash2,
  Sparkles,
  Wifi,
  Bath,
  Utensils,
  BookOpen,
  Bed,
  Shirt
} from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: Listing[];
  onRemoveListing: (id: string) => void;
  universityName: string;
  gateName?: string;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  listings,
  onRemoveListing,
  universityName,
  gateName,
}) => {
  if (!isOpen || listings.length === 0) return null;

  // Identify lowest rent
  const lowestRent = Math.min(...listings.map((l) => l.monthly_rent));

  const parentShareUrl = generateParentShareWhatsAppLink(listings, universityName, gateName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[94vh] flex flex-col text-slate-800 dark:text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Side-by-Side Bodim Comparison
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {listings.length} Selected
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparing accommodation options near {universityName} {gateName && `(${gateName})`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Share with Parents CTA */}
            <a
              href={parentShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition shadow-sm"
              title="Send a formatted Sinhala/English summary to parents on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Share with Parents</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Table Area */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6 text-xs">
          <div className="min-w-[650px] space-y-4">
            {/* Grid of Listings */}
            <div className={`grid gap-4 ${
              listings.length === 1 ? 'grid-cols-1' : listings.length === 2 ? 'grid-cols-2' : listings.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
            }`}>
              {listings.map((item) => {
                const { distanceText, walkTimeText } = formatDistanceAndWalkTime(item.distance_meters);
                const depositTotal = item.monthly_rent * item.key_money_months;
                const totalMoveIn = item.monthly_rent + depositTotal;
                const isBestValue = item.monthly_rent === lowestRent && listings.length > 1;

                const whatsappUrl = item.host_phone
                  ? generateWhatsAppLink({
                      phone: item.host_phone,
                      hostName: item.host_name,
                      listingTitle: item.title,
                      listingId: item.id,
                    })
                  : '#';

                return (
                  <div
                    key={item.id}
                    className="relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 p-4 shadow-sm hover:shadow-md transition"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => onRemoveListing(item.id)}
                      className="absolute top-2.5 right-2.5 z-10 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition shadow"
                      title="Remove from comparison"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    <div>
                      {/* Image */}
                      <div className="relative h-36 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3">
                        <Image
                          src={item.images[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'}
                          alt={item.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        {isBestValue && (
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Lowest Price</span>
                          </div>
                        )}
                      </div>

                      {/* Title & Host */}
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                        {item.host_is_verified ? (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <ShieldCheck className="w-3 h-3" /> NIC Verified Host
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                            <ShieldAlert className="w-3 h-3" /> Unverified
                          </span>
                        )}
                      </div>

                      {/* Comparison Attributes */}
                      <div className="mt-4 space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        {/* Monthly Rent */}
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Rent</span>
                          <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                            {formatLKR(item.monthly_rent)}
                          </div>
                        </div>

                        {/* Key Money & Total Upfront */}
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40">
                            <div className="text-amber-700 dark:text-amber-400 text-[10px] font-semibold">Key Money</div>
                            <div className="font-extrabold text-amber-900 dark:text-amber-200 mt-0.5">
                              {item.key_money_months} {item.key_money_months === 1 ? 'Month' : 'Months'}
                            </div>
                            <div className="text-[10px] text-amber-600/80 mt-0.5">{formatLKR(depositTotal)}</div>
                          </div>

                          <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40">
                            <div className="text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">Initial Total</div>
                            <div className="font-extrabold text-emerald-900 dark:text-emerald-200 mt-0.5">
                              {formatLKR(totalMoveIn)}
                            </div>
                            <div className="text-[10px] text-emerald-600/80 mt-0.5">Rent + Deposit</div>
                          </div>
                        </div>

                        {/* Campus Proximity & Walk */}
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Campus Distance</span>
                          <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                            {distanceText} • {walkTimeText}
                          </div>
                          {item.nearest_landmark && (
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                              Near {item.nearest_landmark}
                            </div>
                          )}
                        </div>

                        {/* Bus Routes */}
                        {item.transit_info && (
                          <div className="p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                            <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300 font-semibold text-[10px]">
                              <Bus className="w-3 h-3" />
                              <span>Bus: {item.transit_info.bus_routes.join(', ')}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {item.transit_info.bus_stop_distance_meters}m to halt • 🛺 ~Rs.{item.transit_info.campus_commute.tuktuk_fare_est} tuk
                            </div>
                          </div>
                        )}

                        {/* Utilities Policy */}
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Zap className="w-3 h-3 text-amber-500" /> Electricity:
                            </span>
                            <span className="font-bold capitalize text-slate-700 dark:text-slate-300">
                              {item.electricity_type === 'separate_meter' ? 'Separate Sub-Meter' : item.electricity_type === 'included' ? 'Free (Included)' : 'Split Bill'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Droplets className="w-3 h-3 text-sky-500" /> Water:
                            </span>
                            <span className="font-bold capitalize text-slate-700 dark:text-slate-300">
                              {item.water_type === 'separate_meter' ? 'Meter Reading' : item.water_type === 'included' ? 'Free (Included)' : 'Split Bill'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Key className="w-3 h-3 text-emerald-500" /> Gate Key:
                            </span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {item.has_gate_key ? 'Yes (Own Key)' : 'No (Host Locks)'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-500" /> Night Curfew:
                            </span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {item.curfew_time ? item.curfew_time.slice(0, 5) : 'No Curfew'}
                            </span>
                          </div>
                        </div>

                        {/* Amenities checklist */}
                        {item.amenities && (
                          <div className="grid grid-cols-2 gap-1 text-[10px] pt-1">
                            <span className={`p-1 rounded flex items-center gap-1 ${item.amenities.has_wifi ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30' : 'text-slate-400 line-through'}`}>
                              <Wifi className="w-2.5 h-2.5" /> WiFi
                            </span>
                            <span className={`p-1 rounded flex items-center gap-1 ${item.amenities.has_attached_bathroom ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30' : 'text-slate-400 line-through'}`}>
                              <Bath className="w-2.5 h-2.5" /> Attached Bath
                            </span>
                            <span className={`p-1 rounded flex items-center gap-1 ${item.amenities.cooking_allowed ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30' : 'text-slate-400 line-through'}`}>
                              <Utensils className="w-2.5 h-2.5" /> Cooking
                            </span>
                            <span className={`p-1 rounded flex items-center gap-1 ${item.amenities.has_study_table ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30' : 'text-slate-400 line-through'}`}>
                              <BookOpen className="w-2.5 h-2.5" /> Study Desk
                            </span>
                            <span className={`p-1 rounded flex items-center gap-1 ${item.amenities.has_bed_and_mattress ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30' : 'text-slate-400 line-through'}`}>
                              <Bed className="w-2.5 h-2.5" /> Mattress
                            </span>
                            <span className={`p-1 rounded flex items-center gap-1 ${item.amenities.has_washing_machine ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30' : 'text-slate-400 line-through'}`}>
                              <Shirt className="w-2.5 h-2.5" /> Washing
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* WhatsApp CTA */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-md shadow-emerald-600/20 transition-all text-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Inquire on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Tip: Share this comparison with family or roommates before committing to key money deposits.
          </div>

          <div className="flex items-center gap-2">
            <a
              href={parentShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share with Parents (WhatsApp)</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
