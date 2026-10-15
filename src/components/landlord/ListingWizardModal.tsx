'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { RoomType, GenderPreference, UtilityBillingType } from '@/types/bodima';
import { 
  X, 
  Check, 
  MapPin, 
  Camera, 
  ShieldCheck, 
  Zap, 
  Droplets, 
  Key, 
  Clock, 
  FileText, 
  UploadCloud,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Star,
  Sparkles,
  Plus,
  AlertTriangle
} from 'lucide-react';

interface ListingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated?: (listingData: any) => void;
}

const SAMPLE_ROOM_PHOTOS = [
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
];

export const ListingWizardModal: React.FC<ListingWizardModalProps> = ({
  isOpen,
  onClose,
  onListingCreated,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isAvailable, setIsAvailable] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  // Validation States
  const [stepError, setStepError] = useState<string | null>(null);
  const [attemptedNext, setAttemptedNext] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    room_type: 'single' as RoomType,
    gender_preference: 'any' as GenderPreference,
    monthly_rent: 18000,
    key_money_months: 1,
    electricity_type: 'separate_meter' as UtilityBillingType,
    water_type: 'included' as UtilityBillingType,
    has_gate_key: true,
    curfew_time: '',
    address_text: '',
    nearest_landmark: '',
    latitude: 7.2549,
    longitude: 80.5974,
    nic_uploaded: false,
    photos: [] as string[],
  });

  if (!isOpen) return null;

  const handleClose = () => {
    setStepError(null);
    setAttemptedNext(false);
    onClose();
  };

  const validateStep1 = () => {
    const isTitleEmpty = !formData.title.trim();
    const isDescEmpty = !formData.description.trim();
    const isRentInvalid = !formData.monthly_rent || formData.monthly_rent <= 0;

    if (isTitleEmpty && isDescEmpty) {
      return 'Please fill in both Listing Title and Description to continue (මාතෘකාව සහ විස්තරය අවශ්‍යයි).';
    }
    if (isTitleEmpty) {
      return 'Please enter a Listing Title for your boarding room (නවාතැන් මාතෘකාව ඇතුළත් කරන්න).';
    }
    if (isDescEmpty) {
      return 'Please provide a short Description describing the room facilities and rules (විස්තරය ඇතුළත් කරන්න).';
    }
    if (isRentInvalid) {
      return 'Please enter a valid Monthly Rent in LKR (වලංගු මාසික කුලියක් ඇතුළත් කරන්න).';
    }
    return null;
  };

  const validateStep2 = () => {
    const isLandmarkEmpty = !formData.nearest_landmark.trim();
    const isAddressEmpty = !formData.address_text.trim();

    if (isLandmarkEmpty && isAddressEmpty) {
      return 'Please enter both the nearest university landmark and street address (ස්ථානය සහ ලිපිනය අවශ්‍යයි).';
    }
    if (isLandmarkEmpty) {
      return 'Please specify the nearest university gate or landmark (ලඟම සරසවි දොරටුව හෝ සලකුණ).';
    }
    if (isAddressEmpty) {
      return 'Please enter the street address for students (ලිපිනය ඇතුළත් කරන්න).';
    }
    return null;
  };

  const handleNext = () => {
    setAttemptedNext(true);

    if (currentStep === 1) {
      const err = validateStep1();
      if (err) {
        setStepError(err);
        contentContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    } else if (currentStep === 2) {
      const err = validateStep2();
      if (err) {
        setStepError(err);
        contentContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setStepError(null);
    setAttemptedNext(false);
    if (currentStep < 3) setCurrentStep((prev) => (prev + 1) as any);
  };

  const handleBack = () => {
    setStepError(null);
    setAttemptedNext(false);
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as any);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            photos: [...prev.photos, event.target!.result as string],
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input value to allow re-uploading the same file if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSetCoverPhoto = (indexToCover: number) => {
    if (indexToCover === 0) return;
    setFormData((prev) => {
      const selected = prev.photos[indexToCover];
      const others = prev.photos.filter((_, idx) => idx !== indexToCover);
      return {
        ...prev,
        photos: [selected, ...others],
      };
    });
  };

  const handleLoadSamplePhotos = () => {
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...SAMPLE_ROOM_PHOTOS.filter((p) => !prev.photos.includes(p))],
    }));
    if (stepError) setStepError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.photos.length === 0) {
      setStepError('Please add at least 1 photo of your boarding room or click "+ Add Sample Photos" before publishing (ඡායාරූප එකතු කරන්න).');
      contentContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setStepError(null);
    onListingCreated?.({
      ...formData,
      is_available: isAvailable,
    });
    alert('Listing successfully published to Bodima database! Your listing is now visible to nearby students.');
    handleClose();
  };

  // Helper flags for invalid fields
  const isTitleMissing = attemptedNext && currentStep === 1 && !formData.title.trim();
  const isDescMissing = attemptedNext && currentStep === 1 && !formData.description.trim();
  const isRentInvalid = attemptedNext && currentStep === 1 && (!formData.monthly_rent || formData.monthly_rent <= 0);
  const isLandmarkMissing = attemptedNext && currentStep === 2 && !formData.nearest_landmark.trim();
  const isAddressMissing = attemptedNext && currentStep === 2 && !formData.address_text.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-slate-800 dark:text-slate-100">
        {/* Wizard Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Landlord Portal (නවාතැන් ලියාපදිංචිය)
              </span>
              {/* Instant Availability Switch */}
              <div className="flex items-center gap-2 ml-3 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-xs">
                <span className="text-slate-500 font-medium">Status:</span>
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`font-bold px-2 py-0.5 rounded-full transition-all ${
                    isAvailable
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {isAvailable ? '● Vacant (Available)' : '● Occupied (Hidden)'}
                </button>
              </div>
            </div>
            <h2 className="text-xl font-extrabold mt-1">Post a Boarding Room / Annex</h2>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Step Progress Indicators */}
        <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold">
          <div className={`p-3 text-center border-b-2 flex items-center justify-center gap-1.5 ${currentStep === 1 ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-[11px]">1</span>
            <span>Details & Rules</span>
          </div>
          <div className={`p-3 text-center border-b-2 flex items-center justify-center gap-1.5 ${currentStep === 2 ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-[11px]">2</span>
            <span>Campus Location</span>
          </div>
          <div className={`p-3 text-center border-b-2 flex items-center justify-center gap-1.5 ${currentStep === 3 ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-[11px]">3</span>
            <span>Photos & Gallery</span>
          </div>
        </div>

        {/* Wizard Step Body */}
        <div ref={contentContainerRef} className="p-6 overflow-y-auto flex-1">
          {/* Caution Message Banner */}
          {stepError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Caution / අවවාදයයි
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {stepError}
                </p>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                  All highlighted blanks must be filled before proceeding to the next step.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStepError(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition"
                title="Dismiss message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Listing Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spacious 2-Bed Study Annex with Balcony"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (stepError && e.target.value.trim()) setStepError(null);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-sm outline-none transition ${
                    isTitleMissing
                      ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500'
                  }`}
                />
                {isTitleMissing && (
                  <p className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 mt-1.5 flex items-center gap-1 animate-in fade-in">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Please fill in the listing title before continuing (නවාතැන් මාතෘකාව අවශ්‍යයි)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe study desks, bathroom, cooking policy, and neighborhood..."
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (stepError && e.target.value.trim()) setStepError(null);
                  }}
                  className={`w-full px-4 py-2 rounded-xl border bg-white dark:bg-slate-800 text-xs outline-none transition ${
                    isDescMissing
                      ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500'
                  }`}
                />
                {isDescMissing && (
                  <p className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 mt-1.5 flex items-center gap-1 animate-in fade-in">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Please fill in a brief description of the room and amenities (විස්තරය අවශ්‍යයි)
                  </p>
                )}
              </div>

              {/* Room Type & Gender Preference */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Room Type
                  </label>
                  <select
                    value={formData.room_type}
                    onChange={(e) => setFormData({ ...formData, room_type: e.target.value as RoomType })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none"
                  >
                    <option value="single">Single Room (තනි කාමරය)</option>
                    <option value="shared">Shared Room (හවුල් කාමරය)</option>
                    <option value="annex">Private Annex (ඇනෙක්ස්)</option>
                    <option value="bed_seater">Bed-Seater (ඇඳක් පමණි)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Gender Preference
                  </label>
                  <select
                    value={formData.gender_preference}
                    onChange={(e) => setFormData({ ...formData, gender_preference: e.target.value as GenderPreference })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none"
                  >
                    <option value="any">Any Gender (සියලු)</option>
                    <option value="male">Boys Only (පිරිමි පමණි)</option>
                    <option value="female">Girls Only (ගැහැණු පමණි)</option>
                  </select>
                </div>
              </div>

              {/* Rent & Deposit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Monthly Rent (LKR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    value={formData.monthly_rent}
                    onChange={(e) => {
                      setFormData({ ...formData, monthly_rent: Number(e.target.value) });
                      if (stepError && Number(e.target.value) > 0) setStepError(null);
                    }}
                    className={`w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-800 text-sm font-bold outline-none transition ${
                      isRentInvalid
                        ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                        : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                  {isRentInvalid && (
                    <p className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 mt-1 flex items-center gap-1 animate-in fade-in">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Please enter a valid monthly rent amount
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Key Money (Months Deposit)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={formData.key_money_months}
                    onChange={(e) => setFormData({ ...formData, key_money_months: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold outline-none"
                  />
                </div>
              </div>

              {/* Utility Billing Transparency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> Electricity Billing
                  </label>
                  <select
                    value={formData.electricity_type}
                    onChange={(e) => setFormData({ ...formData, electricity_type: e.target.value as UtilityBillingType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none"
                  >
                    <option value="separate_meter">Separate Sub-Meter (වෙනම මීටරය)</option>
                    <option value="split_bill">Split Bill Evenly (බිල බෙදාගැනීම)</option>
                    <option value="included">Free / Included in Rent (මිලට ඇතුළත්)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-sky-500" /> Water Billing
                  </label>
                  <select
                    value={formData.water_type}
                    onChange={(e) => setFormData({ ...formData, water_type: e.target.value as UtilityBillingType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none"
                  >
                    <option value="included">Free / Included in Rent (නොමිලේ)</option>
                    <option value="separate_meter">Separate Water Meter (වෙනම මීටරය)</option>
                    <option value="split_bill">Split Water Bill (බිල බෙදාගැනීම)</option>
                  </select>
                </div>
              </div>

              {/* Curfew & Gate Access */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-emerald-500" /> Gate Key Policy
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, has_gate_key: true })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border ${formData.has_gate_key ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600' : 'border-slate-300 dark:border-slate-700 text-slate-500'}`}
                    >
                      Key Provided
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, has_gate_key: false })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border ${!formData.has_gate_key ? 'bg-rose-500/10 border-rose-500 text-rose-600' : 'border-slate-300 dark:border-slate-700 text-slate-500'}`}
                    >
                      No Gate Key
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Curfew (Leave empty if 24/7)
                  </label>
                  <input
                    type="time"
                    value={formData.curfew_time}
                    onChange={(e) => setFormData({ ...formData, curfew_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Nearest University or Landmark <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 250m to Peradeniya Galaha Gate / William Gopallawa Apex Tuition / Kandy Hospital"
                  value={formData.nearest_landmark}
                  onChange={(e) => {
                    setFormData({ ...formData, nearest_landmark: e.target.value });
                    if (stepError && e.target.value.trim()) setStepError(null);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-sm outline-none transition ${
                    isLandmarkMissing
                      ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500'
                  }`}
                />
                {isLandmarkMissing && (
                  <p className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 mt-1 flex items-center gap-1 animate-in fade-in">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Please specify the nearest university campus gate or landmark (අනිවාර්යයි)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Full Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 42, Molpe Road, Katubedda, Moratuwa"
                  value={formData.address_text}
                  onChange={(e) => {
                    setFormData({ ...formData, address_text: e.target.value });
                    if (stepError && e.target.value.trim()) setStepError(null);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-sm outline-none transition ${
                    isAddressMissing
                      ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500'
                  }`}
                />
                {isAddressMissing && (
                  <p className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 mt-1 flex items-center gap-1 animate-in fade-in">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Please enter the street address for student navigations (අනිවාර්යයි)
                  </p>
                )}
              </div>

              {/* Pinpoint Location Preview */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Geocoded PostGIS Coordinates: ({formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)})</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Your coordinates will automatically generate an exact distance tag (e.g. &ldquo;350m walk from Campus&rdquo;) for university students searching on Bodima.
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
              {/* Photo Upload Zone with Drag & Drop & Local File Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Room & Annex Photos ({formData.photos.length} uploaded)
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadSamplePhotos}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+ Add Sample Photos (ආදර්ශ ඡායාරූප)</span>
                  </button>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Upload Trigger Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50 dark:bg-slate-800/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 group"
                >
                  <UploadCloud className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 mb-2 transition" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Click to browse photos from computer or mobile
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Upload images of bed, study table, bathroom, kitchenette & entrance (PNG, JPG up to 10MB)
                  </p>
                </div>

                {/* Uploaded Photos Grid */}
                {formData.photos.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                      <span>Click the star (★) to set as Cover Photo</span>
                      <span>{formData.photos.length} photos</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {formData.photos.map((photo, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 group shadow-sm bg-slate-100 dark:bg-slate-800"
                        >
                          <img
                            src={photo}
                            alt={`Room Photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Cover Badge on 1st Photo */}
                          {idx === 0 ? (
                            <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-white" /> Cover Photo
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetCoverPhoto(idx);
                              }}
                              className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 bg-black/70 hover:bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow transition flex items-center gap-1"
                              title="Make this the main cover photo"
                            >
                              <Star className="w-2.5 h-2.5" /> Make Cover
                            </button>
                          )}

                          {/* Delete Photo Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePhoto(idx);
                            }}
                            className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition shadow"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Add More Photos Card in Grid */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-video rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-600 text-xs font-bold transition bg-slate-50/50 dark:bg-slate-800/30"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add More</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Optional NIC Verification for Verified Host Badge */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Get Verified Host Badge (Sri Lankan NIC / Utility Bill)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Verified hosts receive 4x more WhatsApp inquiries from parents and students due to safety verification.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, nic_uploaded: !formData.nic_uploaded })}
                      className={`mt-3 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        formData.nic_uploaded
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {formData.nic_uploaded ? '✓ NIC Document Attached' : '+ Attach National ID Card (NIC)'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {stepError && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 animate-in fade-in">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Please fill in the required blanks to continue</span>
              <span className="sm:hidden">Required fields missing</span>
            </div>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition active:scale-95"
            >
              Continue to Step {currentStep + 1} <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition active:scale-95"
            >
              <Check className="w-4 h-4" /> Publish Bodim Listing ({formData.photos.length} Photos)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
