'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Listing } from '@/types/bodima';
import { formatLKR, formatDistanceAndWalkTime, generateWhatsAppLink } from '@/lib/utils/formatters';
import { CEBCalculatorModal } from '@/components/calculator/CEBCalculatorModal';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  Droplets, 
  Key, 
  Clock, 
  MessageCircle, 
  Phone, 
  Star, 
  Bus, 
  Navigation, 
  Heart, 
  Wifi, 
  Bath, 
  Utensils, 
  BookOpen, 
  Bed, 
  Shirt, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Calculator,
  ExternalLink,
  Share2
} from 'lucide-react';

interface ListingDetailModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  isShortlisted?: boolean;
  onToggleShortlist?: (listing: Listing) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  isOpen,
  onClose,
  isShortlisted = false,
  onToggleShortlist,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isCEBCalcOpen, setIsCEBCalcOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !listing) return null;

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'];

  const { distanceText, walkTimeText } = formatDistanceAndWalkTime(listing.distance_meters);
  const depositTotal = listing.monthly_rent * listing.key_money_months;

  const whatsappUrl = listing.host_phone
    ? generateWhatsAppLink({
        phone: listing.host_phone,
        hostName: listing.host_name,
        listingTitle: listing.title,
        listingId: listing.id,
      })
    : '#';

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`;

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleShare = () => {
    const text = `Check out this boarding near ${listing.nearest_landmark || 'Campus'}: ${listing.title} - ${formatLKR(listing.monthly_rent)}/mo on Bodima.lk`;
    if (navigator.share) {
      navigator.share({ title: listing.title, text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const genderBadgeConfig = {
    male: { label: 'Boys Only (පිරිමි පමණි)', bg: 'bg-blue-600 text-white' },
    female: { label: 'Girls Only (ගැහැණු පමණි)', bg: 'bg-rose-600 text-white' },
    any: { label: 'Any Gender (සියලු)', bg: 'bg-emerald-600 text-white' },
  }[listing.gender_preference];

  const roomTypeLabel = {
    single: 'Single Room (තනි කාමරය)',
    shared: 'Shared Room (හවුල් කාමරය)',
    annex: 'Private Annex (ඇනෙක්ස්)',
    bed_seater: 'Bed-Seater (ඇඳක් පමණි)',
  }[listing.room_type];

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl text-slate-800 dark:text-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Bodima Listing Details
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {listing.is_available ? '● Vacant (Available Now)' : '● Occupied'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
                title="Share Listing with Parents/Friends"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onToggleShortlist?.(listing)}
                className={`p-2 rounded-full transition ${
                  isShortlisted 
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-800' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500'
                }`}
                title={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
              >
                <Heart className={`w-4 h-4 ${isShortlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="overflow-y-auto flex-1">
            {/* 1. PHOTO GALLERY HERO CAROUSEL */}
            <div className="relative h-64 sm:h-80 md:h-96 w-full bg-slate-900 group">
              <Image
                src={images[activeImageIndex]}
                alt={`${listing.title} - Photo ${activeImageIndex + 1}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              {/* Prev / Next Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition shadow-lg opacity-80 group-hover:opacity-100 hover:scale-105 active:scale-95"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition shadow-lg opacity-80 group-hover:opacity-100 hover:scale-105 active:scale-95"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Top Badges on Image */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full shadow-md ${genderBadgeConfig.bg}`}>
                    {genderBadgeConfig.label}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-md border border-white/20 shadow-md">
                    {roomTypeLabel}
                  </span>
                  {listing.has_meals_option && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500 text-slate-900 shadow-md">
                      🍲 කෑම සහිතයි (Meals Available)
                    </span>
                  )}
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10">
                  📷 {activeImageIndex + 1} / {images.length}
                </span>
              </div>

              {/* Bottom Image Overlay: Title & Distance */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{distanceText}</span>
                  <span className="text-white/60">• {walkTimeText}</span>
                  {listing.avg_rating && (
                    <>
                      <span className="text-white/60">•</span>
                      <span className="flex items-center gap-1 text-amber-300 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-300" />
                        {listing.avg_rating.toFixed(1)} ({listing.review_count || 1})
                      </span>
                    </>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold drop-shadow-md">
                  {listing.title}
                </h2>
              </div>
            </div>

            {/* Thumbnail Navigation Strip */}
            {images.length > 1 && (
              <div className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-bold text-slate-500 shrink-0 uppercase tracking-wider">
                  Photos:
                </span>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-10 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                      activeImageIndex === idx 
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-105' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Content Area */}
            <div className="p-5 sm:p-6 space-y-6">
              {/* Copied Link Toast */}
              {copiedLink && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Listing link copied to clipboard! Ready to paste into WhatsApp.</span>
                </div>
              )}

              {/* 2. PRICING & FINANCIAL COMMITMENT TILES */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    Monthly Rent
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {formatLKR(listing.monthly_rent)}
                  </div>
                  <span className="text-[11px] text-slate-400">per calendar month</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Key Money Deposit
                  </span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {listing.key_money_months === 0 ? 'No Deposit' : `${listing.key_money_months} Mo. (${formatLKR(depositTotal)})`}
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Refundable on move-out</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> Electricity
                  </span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {listing.electricity_type === 'separate_meter' && 'Separate Sub-Meter'}
                    {listing.electricity_type === 'split_bill' && 'Split Bill Evenly'}
                    {listing.electricity_type === 'included' && 'Free in Rent'}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCEBCalcOpen(true)}
                    className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold hover:underline mt-0.5 flex items-center gap-0.5"
                  >
                    <Calculator className="w-3 h-3" /> Calculate CEB
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-sky-500" /> Water Supply
                  </span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {listing.water_type === 'included' ? 'Free in Rent' : 'Separate Meter'}
                  </div>
                  <span className="text-[11px] text-slate-400">Overhead Tank / Well</span>
                </div>
              </div>

              {/* 3. COMMUTE & BUS TRANSIT MATRIX */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <Bus className="w-4 h-4 text-blue-500" />
                    <span>Campus & City Commute Matrix</span>
                  </h4>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Google Maps Route</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="font-semibold text-slate-400 block mb-0.5">Walking to Campus:</span>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                      🚶 {walkTimeText}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {listing.nearest_landmark ? `To ${listing.nearest_landmark}` : 'To nearest campus entrance'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="font-semibold text-slate-400 block mb-0.5">Bus Transit:</span>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                      🚌 {listing.transit_info ? `Route ${listing.transit_info.bus_routes[0]}` : 'Route 654'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {listing.transit_info ? `${listing.transit_info.bus_stop_distance_meters}m walk to bus halt` : 'Short walk to bus stop'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="font-semibold text-slate-400 block mb-0.5">Tuk-Tuk Fare Est.:</span>
                    <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      🛺 {listing.transit_info ? `~Rs. ${listing.transit_info.campus_commute.tuktuk_fare_est}` : '~Rs. 150 - 200'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Local meter / PickMe Tuk estimate
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. CURFEW, SECURITY & STUDY RULES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Gate Key & Entrance Policy</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {listing.has_gate_key 
                      ? '✓ Individual Gate Key provided. Students enjoy 24/7 unrestricted access for late lab or library work.' 
                      : 'No gate key. Landlord/warden controls main gate access.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Curfew & Quiet Study Hours</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {listing.curfew_time 
                      ? `Gate lock time at ${listing.curfew_time.slice(0, 5)}. Strict quiet study atmosphere after 9:30 PM.` 
                      : (listing.curfew_note || 'No curfew time. Quiet hours observed for academic focus.')}
                  </p>
                </div>
              </div>

              {/* 5. AMENITIES INCLUDED */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Room Features & Amenities
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${listing.amenities?.has_wifi ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'}`}>
                    <Wifi className="w-4 h-4 text-emerald-500" />
                    <span>WiFi Fiber Internet</span>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${listing.amenities?.has_attached_bathroom ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'}`}>
                    <Bath className="w-4 h-4 text-emerald-500" />
                    <span>Attached Bathroom</span>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${listing.amenities?.cooking_allowed ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'}`}>
                    <Utensils className="w-4 h-4 text-emerald-500" />
                    <span>Cooking Allowed</span>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${listing.amenities?.has_study_table ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'}`}>
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <span>Study Table & Chair</span>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${listing.amenities?.has_bed_and_mattress ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'}`}>
                    <Bed className="w-4 h-4 text-emerald-500" />
                    <span>Bed & Mattress</span>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${listing.amenities?.has_washing_machine ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'}`}>
                    <Shirt className="w-4 h-4 text-emerald-500" />
                    <span>Washing Facility</span>
                  </div>
                </div>
              </div>

              {/* 6. ROOM DESCRIPTION */}
              {listing.description && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Landlord Description
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                    {listing.description}
                  </p>
                </div>
              )}

              {/* 7. ADDRESS & EXACT LANDMARK */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {listing.nearest_landmark ? `Near ${listing.nearest_landmark}` : 'Campus Vicinity'}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {listing.address_text}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Coordinates: ({listing.latitude.toFixed(4)}, {listing.longitude.toFixed(4)})
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer: Landlord Contact & Direct Actions */}
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Host Details */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow">
                {listing.host_name ? listing.host_name[0] : 'H'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {listing.host_name || 'Verified Bodima Host'}
                  </span>
                  {listing.host_is_verified ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-500 flex items-center gap-0.5">
                      <ShieldAlert className="w-3 h-3" /> Basic
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {listing.host_phone || '+94771234567'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {listing.host_phone && (
                <a
                  href={`tel:${listing.host_phone}`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Call</span>
                </a>
              )}

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-lg shadow-emerald-600/30 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Standalone CEB Calculator for this room */}
      {isCEBCalcOpen && (
        <CEBCalculatorModal
          isOpen={isCEBCalcOpen}
          onClose={() => setIsCEBCalcOpen(false)}
        />
      )}
    </>
  );
};
