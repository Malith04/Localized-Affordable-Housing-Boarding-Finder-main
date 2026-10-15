'use client';

import React from 'react';
import Image from 'next/image';
import { Listing } from '@/types/bodima';
import { generateParentShareWhatsAppLink } from '@/lib/utils/formatters';
import { Scale, Share2, X, Sparkles } from 'lucide-react';

interface ComparisonFloatingBarProps {
  shortlistedListings: Listing[];
  onOpenCompare: () => void;
  onClearAll: () => void;
  universityName: string;
  gateName?: string;
}

export const ComparisonFloatingBar: React.FC<ComparisonFloatingBarProps> = ({
  shortlistedListings,
  onOpenCompare,
  onClearAll,
  universityName,
  gateName,
}) => {
  if (shortlistedListings.length === 0) return null;

  const parentShareUrl = generateParentShareWhatsAppLink(shortlistedListings, universityName, gateName);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-3 sm:p-3.5 rounded-2xl sm:rounded-full bg-slate-900/95 dark:bg-slate-900/95 text-white border border-slate-700/80 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Thumbnails & Counter */}
        <div className="flex items-center gap-3">
          {/* Stacked Images */}
          <div className="flex -space-x-2.5 overflow-hidden">
            {shortlistedListings.slice(0, 4).map((listing, idx) => (
              <div
                key={listing.id}
                className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-slate-900 shadow-md bg-slate-800"
              >
                <Image
                  src={listing.images[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80'}
                  alt={listing.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="text-left">
            <div className="text-xs font-extrabold flex items-center gap-1.5">
              <span>{shortlistedListings.length} Bodim Shortlisted</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                ❤️ Saved
              </span>
            </div>
            <div className="text-[10px] text-slate-400 hidden sm:block">
              Compare amenities, advance & share with family
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Share with Parents Direct Button */}
          <a
            href={parentShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl sm:rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-emerald-300 border border-emerald-400/30 transition active:scale-95 shadow-sm"
            title="Share with Parents on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Parents</span>
          </a>

          {/* Compare Side-by-Side Button */}
          <button
            type="button"
            onClick={onOpenCompare}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl sm:rounded-full text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 active:scale-95 transition"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Compare ({shortlistedListings.length})</span>
          </button>

          {/* Clear Button */}
          <button
            type="button"
            onClick={onClearAll}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Clear shortlisted items"
            aria-label="Clear shortlisted items"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
