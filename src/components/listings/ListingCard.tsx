'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Listing } from '@/types/bodima';
import { formatLKR, formatDistanceAndWalkTime, generateWhatsAppLink } from '@/lib/utils/formatters';
import { UtilityBreakdownCard } from './UtilityBreakdownCard';
import { 
  MapPin, 
  ShieldCheck, 
  Zap, 
  Droplets, 
  Key, 
  Clock, 
  MessageCircle, 
  Star, 
  Eye, 
  Users, 
  User, 
  Home, 
  Building,
  Bus,
  Heart
} from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  isSelected?: boolean;
  isShortlisted?: boolean;
  onSelect?: (listing: Listing) => void;
  onLocateOnMap?: (listing: Listing) => void;
  onToggleShortlist?: (listing: Listing) => void;
  onViewDetails?: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isSelected = false,
  isShortlisted = false,
  onSelect,
  onLocateOnMap,
  onToggleShortlist,
  onViewDetails,
}) => {
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const { distanceText, walkTimeText } = formatDistanceAndWalkTime(listing.distance_meters);

  const whatsappUrl = listing.host_phone
    ? generateWhatsAppLink({
        phone: listing.host_phone,
        hostName: listing.host_name,
        listingTitle: listing.title,
        listingId: listing.id,
      })
    : '#';

  // Gender badge styling
  const genderBadgeConfig = {
    male: { label: 'Boys Only', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
    female: { label: 'Girls Only', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
    any: { label: 'Any Gender', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  }[listing.gender_preference];

  // Room type label
  const roomTypeLabel = {
    single: 'Single Room',
    shared: 'Shared Room',
    annex: 'Private Annex',
    bed_seater: 'Bed-Seater',
  }[listing.room_type];

  const primaryImage = listing.images && listing.images.length > 0
    ? listing.images[0]
    : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';

  const handleLocateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(listing);
    onLocateOnMap?.(listing);
  };

  return (
    <>
      <div 
        onClick={() => {
          onSelect?.(listing);
          onViewDetails?.(listing);
        }}
        className={`group relative rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-300 overflow-hidden flex flex-col cursor-pointer ${
          isSelected 
            ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl shadow-emerald-500/10 -translate-y-1' 
            : 'border-slate-200 dark:border-slate-800/80 hover:border-emerald-400/60 dark:hover:border-emerald-600 hover:shadow-lg'
        }`}
      >
        {/* Image Container */}
        <div className="relative h-52 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <Image
            src={primaryImage}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md ${genderBadgeConfig.bg}`}>
                {genderBadgeConfig.label}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-md border border-white/10">
                {roomTypeLabel}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Shortlist Heart Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleShortlist?.(listing);
                }}
                title={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist / Compare (සංසන්දනයට එක්කරන්න)'}
                className={`p-1.5 rounded-full border backdrop-blur-md transition shadow-md hover:scale-110 active:scale-95 ${
                  isShortlisted
                    ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-400/40'
                    : 'bg-black/60 hover:bg-rose-600/80 text-white border-white/20'
                }`}
                aria-label="Toggle shortlist"
              >
                <Heart className={`w-4 h-4 ${isShortlisted ? 'fill-white text-white' : 'text-white'}`} />
              </button>

              {/* Locate on Map Quick Pin Button on Image */}
              <button
                type="button"
                onClick={handleLocateClick}
                title="Pinpoint on Map"
                className="p-1.5 rounded-full bg-black/60 hover:bg-emerald-600 text-white border border-white/20 backdrop-blur-md transition shadow-md hover:scale-110 active:scale-95"
              >
                <MapPin className="w-4 h-4 text-emerald-400 group-hover:text-white" />
              </button>
            </div>
          </div>

          {/* Bottom Overlay: Distance & Landmark */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-1 font-medium bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{distanceText}</span>
              <span className="text-white/60">• {walkTimeText}</span>
            </div>

            {listing.avg_rating && listing.avg_rating > 0 && (
              <div className="flex items-center gap-1 font-bold bg-black/60 px-2 py-1 rounded-lg backdrop-blur-md border border-white/10 text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                <span>{listing.avg_rating.toFixed(1)}</span>
                <span className="text-white/60 font-normal">({listing.review_count || 1})</span>
              </div>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Title & Landmark */}
            <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {listing.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              {listing.nearest_landmark ? `Near ${listing.nearest_landmark}` : listing.address_text}
            </p>

            {/* Utility Quick-Check Badges */}
            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
              {/* Electricity */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">
                <Zap className="w-3 h-3" />
                {listing.electricity_type === 'separate_meter' ? 'Sub-Meter' : listing.electricity_type === 'included' ? 'Free Power' : 'Split Bill'}
              </span>

              {/* Water */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-400 font-medium">
                <Droplets className="w-3 h-3" />
                {listing.water_type === 'included' ? 'Water Free' : 'Water Meter'}
              </span>

              {/* Curfew / Gate Key */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                {listing.has_gate_key ? (
                  <>
                    <Key className="w-3 h-3 text-emerald-500" /> Gate Key
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-amber-500" /> {listing.curfew_time ? `Curfew: ${listing.curfew_time.slice(0, 5)}` : 'No Gate Key'}
                  </>
                )}
              </span>

              {/* Kandy Meals Option Badge */}
              {listing.has_meals_option && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  🍲 කෑම සහිතයි (Meals Avail.)
                </span>
              )}

              {/* Target Audience Badge */}
              {listing.target_audience && listing.target_audience !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold border border-indigo-500/20">
                  {listing.target_audience === 'school_student' && '🎒 පාසල් / A/L'}
                  {listing.target_audience === 'working_professional' && '💼 රෝහල් / කාර්යාල'}
                  {listing.target_audience === 'campus_student' && '🎓 පේරාදෙණිය / UoP'}
                </span>
              )}
            </div>

            {/* Sri Lankan Bus Route & Commute Proximity */}
            {listing.transit_info && (
              <div className="mt-3 flex items-center justify-between text-[11px] p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5 truncate">
                  <div className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Bus className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    Bus {listing.transit_info.bus_routes.slice(0, 3).join(', ')}
                  </span>
                  <span className="text-slate-400 truncate hidden xs:inline">
                    • {listing.transit_info.bus_stop_distance_meters}m halt
                  </span>
                </div>

                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 px-2 py-0.5 rounded-md shrink-0">
                  🛺 ~Rs.{listing.transit_info.campus_commute.tuktuk_fare_est} tuk
                </span>
              </div>
            )}
          </div>

          {/* Pricing & Call To Action */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {formatLKR(listing.monthly_rent)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">/ month</span>
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {listing.key_money_months} mo. deposit
              </div>
            </div>

            {/* 3-Button Action Ribbon */}
            <div className="grid grid-cols-12 gap-2">
              {/* Map Preview Icon Button */}
              <button
                type="button"
                onClick={handleLocateClick}
                className="col-span-3 inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                title="View Boarding on Map"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Map</span>
              </button>

              {/* Utility & Interactive Details Trigger */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onViewDetails) {
                    onViewDetails(listing);
                  } else {
                    setShowBreakdownModal(true);
                  }
                }}
                className="col-span-4 inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-500" />
                Details
              </button>

              {/* WhatsApp Direct CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="col-span-5 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-md shadow-emerald-600/20 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for detailed utility breakdown */}
      {showBreakdownModal && (
        <UtilityBreakdownCard
          listing={listing}
          isOpenModal={true}
          onClose={() => setShowBreakdownModal(false)}
        />
      )}
    </>
  );
};
