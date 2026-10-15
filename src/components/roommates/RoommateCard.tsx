'use client';

import React from 'react';
import Image from 'next/image';
import { RoommatePost } from '@/types/bodima';
import { formatLKR } from '@/lib/utils/formatters';
import { 
  GraduationCap, 
  ShieldCheck, 
  MapPin, 
  Users, 
  MessageCircle, 
  Calendar,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface RoommateCardProps {
  post: RoommatePost;
}

export const RoommateCard: React.FC<RoommateCardProps> = ({ post }) => {
  const whatsappUrl = `https://wa.me/${post.phone_number.replace(/\+/g, '')}?text=${encodeURIComponent(
    `Hi ${post.student_name}, I saw your Bodim Match profile on Bodima.lk for ${post.university_name} (${post.faculty}). Are you still looking for a roommate?`
  )}`;

  const genderBadge = {
    male: { label: 'Boy Roommate (පිරිමි)', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
    female: { label: 'Girl Roommate (ගැහැණු)', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
  }[post.gender];

  const [imgError, setImgError] = React.useState(false);
  const initials = post.student_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-400/60 dark:hover:border-emerald-600 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Header Card Info */}
      <div className="p-5 pb-3">
        {/* Profile Avatar & Primary Badges */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-500/30 shrink-0 shadow-sm bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-sm">
              {!imgError ? (
                <Image
                  src={post.avatar_url}
                  alt={post.student_name}
                  fill
                  unoptimized
                  sizes="56px"
                  onError={() => setImgError(true)}
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                  {post.student_name}
                </h3>
                {post.is_verified_student && (
                  <span title="Verified University Student" className="text-emerald-500 shrink-0">
                    <ShieldCheck className="w-4 h-4 fill-emerald-500/20" />
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">{post.university_name}</span>
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                {post.faculty} • {post.academic_year}
              </div>
            </div>
          </div>

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${genderBadge.bg}`}>
            {genderBadge.label}
          </span>
        </div>

        {/* Budget & Target Roommate Requirement Pill */}
        <div className="mt-4 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-400">
              Budget Per Person
            </div>
            <div className="text-base font-black text-emerald-700 dark:text-emerald-300">
              {formatLKR(post.budget_per_person)}
              <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 ml-1">/ month</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Teaming Up For
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 justify-end">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>{post.needed_roommates_count} {post.needed_roommates_count === 1 ? 'Roommate' : 'Roommates'}</span>
            </div>
          </div>
        </div>

        {/* Preferred Locations */}
        <div className="mt-3 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="text-[11px] font-medium line-clamp-1">
            Prefers: {post.preferred_locations.join(', ')}
          </span>
        </div>

        {/* Bio */}
        <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-3 italic bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
          &ldquo;{post.bio}&rdquo;
        </p>

        {/* Lifestyle & Study Habits Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40">
            {post.study_habit}
          </span>
          {post.lifestyle_tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-md shadow-emerald-600/20 transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Connect on WhatsApp ({post.student_name.split(' ')[0]})</span>
        </a>
      </div>
    </div>
  );
};
