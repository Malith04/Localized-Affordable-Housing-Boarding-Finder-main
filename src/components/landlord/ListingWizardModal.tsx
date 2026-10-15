'use client';

import React, { useState } from 'react';
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
  ChevronLeft
} from 'lucide-react';

interface ListingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated?: (listingData: any) => void;
}

export const ListingWizardModal: React.FC<ListingWizardModalProps> = ({
  isOpen,
  onClose,
  onListingCreated,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isAvailable, setIsAvailable] = useState(true);

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

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep((prev) => (prev + 1) as any);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as any);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onListingCreated?.({
      ...formData,
      is_available: isAvailable,
    });
    alert('Listing successfully published to Bodima database! Your listing is now visible to nearby students.');
    onClose();
  };

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
            onClick={onClose}
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
            <span>Photos & Verification</span>
          </div>
        </div>

        {/* Wizard Step Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Listing Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Quiet Single Study Room, 300m to Moratuwa Campus"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Room Type
                  </label>
                  <select
                    value={formData.room_type}
                    onChange={(e) => setFormData({ ...formData, room_type: e.target.value as RoomType })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
                  >
                    <option value="single">Single Room (තනි කාමරය)</option>
                    <option value="shared">Shared Room (දෙදෙනෙකුට)</option>
                    <option value="annex">Separate Annex (ඇනෙක්ස්)</option>
                    <option value="bed_seater">Bed-Seater</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Gender Preference
                  </label>
                  <select
                    value={formData.gender_preference}
                    onChange={(e) => setFormData({ ...formData, gender_preference: e.target.value as GenderPreference })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
                  >
                    <option value="any">Any Gender / Mixed</option>
                    <option value="male">Boys Only (පිරිමි ළමුන් පමණි)</option>
                    <option value="female">Girls Only (ගැහැණු ළමුන් පමණි)</option>
                  </select>
                </div>
              </div>

              {/* Financials */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Monthly Rent (LKR)
                  </label>
                  <input
                    type="number"
                    value={formData.monthly_rent}
                    onChange={(e) => setFormData({ ...formData, monthly_rent: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Key Money Advance
                  </label>
                  <select
                    value={formData.key_money_months}
                    onChange={(e) => setFormData({ ...formData, key_money_months: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
                  >
                    <option value={0}>No Key Money (0 Months)</option>
                    <option value={1}>1 Month Deposit</option>
                    <option value={2}>2 Months Deposit</option>
                    <option value={3}>3 Months Deposit</option>
                  </select>
                </div>
              </div>

              {/* Utilities Policy */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> Electricity Billing
                  </label>
                  <select
                    value={formData.electricity_type}
                    onChange={(e) => setFormData({ ...formData, electricity_type: e.target.value as UtilityBillingType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none"
                  >
                    <option value="separate_meter">Separate Sub-Meter</option>
                    <option value="split_bill">Split Monthly Bill</option>
                    <option value="included">Free / Included in Rent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-sky-500" /> Water Billing
                  </label>
                  <select
                    value={formData.water_type}
                    onChange={(e) => setFormData({ ...formData, water_type: e.target.value as UtilityBillingType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none"
                  >
                    <option value="included">Free / Included in Rent</option>
                    <option value="split_bill">Split Monthly Bill</option>
                    <option value="separate_meter">Separate Meter</option>
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
                  Nearest University or Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. 250m to Peradeniya Galaha Gate / William Gopallawa Apex Tuition / Kandy Hospital"
                  value={formData.nearest_landmark}
                  onChange={(e) => setFormData({ ...formData, nearest_landmark: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Full Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 42, Molpe Road, Katubedda, Moratuwa"
                  value={formData.address_text}
                  onChange={(e) => setFormData({ ...formData, address_text: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
                />
              </div>

              {/* Pinpoint Location Preview */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Geocoded PostGIS Coordinates: ({formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)})</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Your coordinates will automatically generate an exact distance tag (e.g. "350m walk from Campus") for university students searching on Bodima.
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
              {/* Photo Upload Zone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Room Photo Gallery (Mobile Snapshots)
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition">
                  <UploadCloud className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Click to upload mobile photos of bed, study desk, bathroom & entrance
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">PNG, JPG up to 10MB each</p>
                </div>
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
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
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

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition"
            >
              Continue to Step {currentStep + 1} <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition"
            >
              <Check className="w-4 h-4" /> Publish Bodim Listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
