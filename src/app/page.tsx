'use client';

import React, { useState, useEffect, useTransition, useRef, useMemo } from 'react';
import Link from 'next/link';
import { SRI_LANKAN_UNIVERSITIES } from '@/lib/constants/universities';
import { Listing, UniversityAnchor, CampusGate, RoomType, GenderPreference, RoommatePost } from '@/types/bodima';
import { searchNearbyBodimAction } from '@/app/actions/searchBodim';
import { generateGeoAnchoredMockListings } from '@/lib/mock/mockListings';
import { INITIAL_MOCK_ROOMMATES } from '@/lib/mock/mockRoommates';
import { ListingCard } from '@/components/listings/ListingCard';
import { RoommateCard } from '@/components/roommates/RoommateCard';
import { CreateRoommatePostModal } from '@/components/roommates/CreateRoommatePostModal';
import { CEBCalculatorModal } from '@/components/calculator/CEBCalculatorModal';
import { ComparisonFloatingBar } from '@/components/comparison/ComparisonFloatingBar';
import { CompareModal } from '@/components/comparison/CompareModal';
import { MapContainer } from '@/components/map/MapContainer';
import { UniversityQuickBar } from '@/components/map/UniversityQuickBar';
import { ListingWizardModal } from '@/components/landlord/ListingWizardModal';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { CustomDropdown, DropdownOption } from '@/components/ui/CustomDropdown';
import { 
  MapPin, 
  Map as MapIcon, 
  PlusCircle, 
  Compass, 
  Sparkles,
  ArrowDown,
  ArrowUp,
  User,
  LogIn,
  Home,
  Users,
  Zap,
  UserPlus,
  Bus,
  Scale,
  Navigation
} from 'lucide-react';

export default function BodimaHomePage() {
  const [activeMainTab, setActiveMainTab] = useState<'boardings' | 'roommates'>('boardings');
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityAnchor>(SRI_LANKAN_UNIVERSITIES[0]);
  const [selectedGate, setSelectedGate] = useState<CampusGate | null>(SRI_LANKAN_UNIVERSITIES[0].gates[0] || null);
  const [radiusMeters, setRadiusMeters] = useState<number>(3000);
  const [genderFilter, setGenderFilter] = useState<GenderPreference | 'any'>('any');
  const [roomTypeFilter, setRoomTypeFilter] = useState<RoomType | 'all'>('all');
  const [maxRent, setMaxRent] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'distance_asc' | 'price_asc' | 'price_desc' | 'rating_desc'>('distance_asc');
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'campus_student' | 'school_student' | 'working_professional'>('all');
  
  // Roommate state
  const [roommates, setRoommates] = useState<RoommatePost[]>(INITIAL_MOCK_ROOMMATES);
  const [roommateGenderFilter, setRoommateGenderFilter] = useState<'any' | 'male' | 'female'>('any');
  const [roommateMaxBudget, setRoommateMaxBudget] = useState<number | null>(null);
  const [isRoommateModalOpen, setIsRoommateModalOpen] = useState(false);
  const [isCEBCalcModalOpen, setIsCEBCalcModalOpen] = useState(false);

  // Shortlist / Comparison state (Feature 4)
  const [shortlistedListingIds, setShortlistedListingIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Active coordinates: prioritize selected faculty gate coordinate
  const activeLat = selectedGate ? selectedGate.latitude : selectedUniversity.latitude;
  const activeLng = selectedGate ? selectedGate.longitude : selectedUniversity.longitude;

  // Initialize with pre-loaded mock data
  const [listings, setListings] = useState<Listing[]>(() =>
    generateGeoAnchoredMockListings(activeLat, activeLng)
  );

  // Filter listings by Kandy target audience
  const filteredListings = useMemo(() => {
    if (audienceFilter === 'all') return listings;
    return listings.filter((l) => l.target_audience === audienceFilter || !l.target_audience);
  }, [listings, audienceFilter]);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isMockDataActive, setIsMockDataActive] = useState(true);

  // Map section ref for smooth scroll-to-map
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const topSectionRef = useRef<HTMLDivElement>(null);

  // Active anchor for Leaflet Map centering
  const activeAnchor: UniversityAnchor = useMemo(() => {
    if (!selectedGate) return selectedUniversity;
    return {
      ...selectedUniversity,
      latitude: selectedGate.latitude,
      longitude: selectedGate.longitude,
      landmarks: [`${selectedGate.name} (${selectedGate.facultiesNearby})`, ...selectedUniversity.landmarks],
    };
  }, [selectedUniversity, selectedGate]);

  // Trigger search on filter or gate change
  const fetchBodimListings = () => {
    startTransition(async () => {
      const res = await searchNearbyBodimAction({
        user_lat: activeLat,
        user_lng: activeLng,
        radius_meters: radiusMeters,
        max_rent: maxRent,
        gender_pref: genderFilter === 'any' ? null : genderFilter,
        room_types: roomTypeFilter === 'all' ? null : [roomTypeFilter],
        sort_by: sortBy,
      });

      if (res.success && res.data && res.data.length > 0) {
        setListings(res.data);
        setIsMockDataActive(Boolean(res.isMock));
      } else {
        // Fallback to dynamic listings calculated from this active gate
        const fallback = generateGeoAnchoredMockListings(activeLat, activeLng);
        setListings(fallback);
        setIsMockDataActive(true);
      }
    });
  };

  useEffect(() => {
    fetchBodimListings();
  }, [selectedUniversity, selectedGate, radiusMeters, genderFilter, roomTypeFilter, maxRent, sortBy]);

  const handleUniversityChange = (uni: UniversityAnchor) => {
    setSelectedUniversity(uni);
    setSelectedGate(uni.gates && uni.gates.length > 0 ? uni.gates[0] : null);
    setRadiusMeters(uni.defaultRadiusMeters);
  };

  const handleGateChange = (gate: CampusGate) => {
    setSelectedGate(gate);
  };

  const handleLocateOnMap = (listing: Listing) => {
    setSelectedListingId(listing.id);
    if (mapSectionRef.current) {
      const top = mapSectionRef.current.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const scrollToMap = () => {
    if (mapSectionRef.current) {
      const top = mapSectionRef.current.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Shortlist handling
  const handleToggleShortlist = (listing: Listing) => {
    setShortlistedListingIds((prev) => {
      if (prev.includes(listing.id)) {
        return prev.filter((id) => id !== listing.id);
      }
      if (prev.length >= 4) {
        // keep up to 4 for comparison
        return [...prev.slice(1), listing.id];
      }
      return [...prev, listing.id];
    });
  };

  const handleRemoveFromShortlist = (id: string) => {
    setShortlistedListingIds((prev) => prev.filter((i) => i !== id));
  };

  const handleClearAllShortlisted = () => {
    setShortlistedListingIds([]);
  };

  const shortlistedListings = useMemo(() => {
    return listings.filter((l) => shortlistedListingIds.includes(l.id));
  }, [listings, shortlistedListingIds]);

  // Filter roommates prioritizing current university
  const filteredRoommates = roommates
    .filter((rm) => {
      const matchesGender = roommateGenderFilter === 'any' || rm.gender === roommateGenderFilter;
      const matchesBudget = !roommateMaxBudget || rm.budget_per_person <= roommateMaxBudget;
      return matchesGender && matchesBudget;
    })
    .sort((a, b) => {
      if (a.university_id === selectedUniversity.id && b.university_id !== selectedUniversity.id) return -1;
      if (b.university_id === selectedUniversity.id && a.university_id !== selectedUniversity.id) return 1;
      return 0;
    });

  // Custom Dropdown Configuration Options
  const radiusOptions: DropdownOption<number>[] = [
    { label: '1.0 km (Walking)', value: 1000, subtitle: '~12 min walk' },
    { label: '2.0 km', value: 2000, subtitle: '~25 min walk' },
    { label: '3.0 km', value: 3000, subtitle: 'Standard campus radius' },
    { label: '5.0 km', value: 5000, subtitle: 'Wider commute zone' },
  ];

  const genderOptions: DropdownOption<GenderPreference | 'any'>[] = [
    { label: 'Any Gender', value: 'any', subtitle: 'All available bodim' },
    { label: 'Boys Only (පිරිමි)', value: 'male', subtitle: 'Male tenants only' },
    { label: 'Girls Only (ගැහැණු)', value: 'female', subtitle: 'Female tenants only' },
  ];

  const roomTypeOptions: DropdownOption<RoomType | 'all'>[] = [
    { label: 'All Room Types', value: 'all', subtitle: 'Single, Shared, Annex' },
    { label: 'Single Room', value: 'single', subtitle: 'Private single study room' },
    { label: 'Shared Room', value: 'shared', subtitle: '2 or more occupants' },
    { label: 'Private Annex', value: 'annex', subtitle: 'Separate unit with pantry' },
    { label: 'Bed-Seater', value: 'bed_seater', subtitle: 'Budget friendly bed space' },
  ];

  const budgetOptions: DropdownOption<number | null>[] = [
    { label: 'Any Price', value: null, subtitle: 'No budget ceiling' },
    { label: 'Under Rs. 12,000', value: 12000, subtitle: 'Budget undergrad rooms' },
    { label: 'Under Rs. 18,000', value: 18000, subtitle: 'Mid-range study rooms' },
    { label: 'Under Rs. 25,000', value: 25000, subtitle: 'Premium rooms & annexes' },
    { label: 'Under Rs. 35,000', value: 35000, subtitle: 'Luxury studios & annexes' },
  ];

  const roommateBudgetOptions: DropdownOption<number | null>[] = [
    { label: 'Any Budget', value: null, subtitle: 'No budget limit' },
    { label: 'Under Rs. 10,000 / mo', value: 10000, subtitle: 'Budget undergrad share' },
    { label: 'Under Rs. 13,000 / mo', value: 13000, subtitle: 'Standard 2-3 bed share' },
    { label: 'Under Rs. 16,000 / mo', value: 16000, subtitle: 'Premium annex share' },
  ];

  const roommateGenderOptions: DropdownOption<'any' | 'male' | 'female'>[] = [
    { label: 'All Roommates', value: 'any', subtitle: 'Boys & Girls' },
    { label: 'Boys Only (පිරිමි)', value: 'male', subtitle: 'Male students' },
    { label: 'Girls Only (ගැහැණු)', value: 'female', subtitle: 'Female students' },
  ];

  const sortOptions: DropdownOption<'distance_asc' | 'price_asc' | 'price_desc' | 'rating_desc'>[] = [
    { label: 'Closest Distance', value: 'distance_asc' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Highest Rated', value: 'rating_desc' },
  ];

  return (
    <div ref={topSectionRef} className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation Bar - Streamlined, Slim & High z-index */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors w-full shadow-sm">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-[1920px] mx-auto h-16 flex items-center justify-between gap-4">
          {/* Logo & Kandy Edition Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-600/30">
              B
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                bodima<span className="text-emerald-500">.lk</span>
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                මහනුවර (Kandy)
              </span>
            </div>
          </div>

          {/* Action CTAs: Clean & Compact */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Compare Shortlist Button (if items selected) */}
            {shortlistedListingIds.length > 0 && (
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition shadow-sm animate-pulse"
              >
                <Scale className="w-3.5 h-3.5 text-rose-500" />
                <span>Compare ({shortlistedListingIds.length})</span>
              </button>
            )}

            {/* CEB Bill Calculator Button */}
            <button
              onClick={() => setIsCEBCalcModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition shadow-sm"
              title="Open CEB Domestic Electricity Bill Calculator"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">CEB Calc</span>
            </button>

            {/* Dark / Light Theme Switcher */}
            <ThemeToggle />

            {/* Compact Auth Button */}
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sign In</span>
            </Link>

            {/* Post Listing CTA (Primary) */}
            <button
              onClick={() => setIsWizardOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95 shadow-emerald-600/20"
            >
              <PlusCircle className="w-4 h-4 text-emerald-100" />
              <span className="hidden sm:inline">List a Bodim</span>
              <span className="sm:hidden">Post</span>
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Banner: Collapsible Kandy Destination & Gate Selector */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-[1920px] mx-auto pt-3 pb-1">
        <UniversityQuickBar
          selectedUniversity={selectedUniversity}
          onSelectUniversity={handleUniversityChange}
          selectedGate={selectedGate}
          onSelectGate={handleGateChange}
        />
      </section>

      {/* Primary Feature Tabs Switcher Bar */}
      <section className="bg-slate-100/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 py-2.5 transition-colors w-full">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-bold">
            {/* Tab 1: Boardings */}
            <button
              onClick={() => setActiveMainTab('boardings')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                activeMainTab === 'boardings'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Discover Boardings (බෝඩිම්)</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeMainTab === 'boardings' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}>
                {filteredListings.length}
              </span>
            </button>

            {/* Tab 2: Bodim Match Roommates */}
            <button
              onClick={() => setActiveMainTab('roommates')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                activeMainTab === 'roommates'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Bodim Match (සහවාසික සෙවුම)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-teal-500 to-emerald-400 text-white shadow-sm">
                MATCH
              </span>
            </button>
          </div>

          {/* Quick Subtitle or CTA */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            {activeMainTab === 'boardings' ? (
              <span className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  Anchor Gate: <strong className="text-slate-700 dark:text-slate-200">{selectedGate ? selectedGate.name : selectedUniversity.shortName}</strong>
                </span>
              </span>
            ) : (
              <button
                onClick={() => setIsRoommateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Post Roommate Request</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* FILTER RIBBON: Contextual to Selected Tab */}
      {activeMainTab === 'boardings' ? (
        <section className="bg-white dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 py-3 transition-colors w-full">
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Custom Styled Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Radius Custom Dropdown */}
              <CustomDropdown
                labelPrefix="Radius"
                options={radiusOptions}
                value={radiusMeters}
                onChange={(val) => setRadiusMeters(val)}
              />

              {/* Gender Custom Dropdown */}
              <CustomDropdown
                labelPrefix="Gender"
                options={genderOptions}
                value={genderFilter}
                onChange={(val) => setGenderFilter(val)}
              />

              {/* Room Type Custom Dropdown */}
              <CustomDropdown
                labelPrefix="Type"
                options={roomTypeOptions}
                value={roomTypeFilter}
                onChange={(val) => setRoomTypeFilter(val)}
              />

              {/* Max Budget Custom Dropdown */}
              <CustomDropdown
                labelPrefix="Budget"
                options={budgetOptions}
                value={maxRent}
                onChange={(val) => setMaxRent(val)}
              />
            </div>

            {/* Right Controls: Sort Dropdown & Jump to Map */}
            <div className="flex items-center gap-2.5 ml-auto">
              {/* Sort Custom Dropdown */}
              <CustomDropdown
                labelPrefix="Sort"
                options={sortOptions}
                value={sortBy}
                onChange={(val) => setSortBy(val)}
              />

              {/* Scroll Down to Map Button */}
              <button
                onClick={scrollToMap}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition shadow-sm"
                title="Jump to Map Preview"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Map View</span>
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* ROOMMATES FILTER RIBBON */
        <section className="bg-white dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 py-3 transition-colors w-full">
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Roommate Gender Dropdown */}
              <CustomDropdown
                labelPrefix="Roommates"
                options={roommateGenderOptions}
                value={roommateGenderFilter}
                onChange={(val) => setRoommateGenderFilter(val)}
              />

              {/* Roommate Budget Ceiling Dropdown */}
              <CustomDropdown
                labelPrefix="Max Share"
                options={roommateBudgetOptions}
                value={roommateMaxBudget}
                onChange={(val) => setRoommateMaxBudget(val)}
              />

              <span className="text-slate-400 hidden md:inline">• Prioritizing batchmates around {selectedUniversity.shortName}</span>
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                onClick={() => setIsRoommateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Post Your Profile</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main Discover Layout - Full Screen Fit */}
      <main className="flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-[1920px] mx-auto py-8 space-y-12">
        
        {/* ========================================================================= */}
        {/* TAB 1: BOARDING ROOMS & MAP DISCOVERY */}
        {/* ========================================================================= */}
        {activeMainTab === 'boardings' && (
          <>
            {/* SECTION 1: SEARCHED BOARDINGS (Full Screen Width Grid) */}
            <section className="space-y-6">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{filteredListings.length} Boarding Rooms near {selectedUniversity.shortName}</span>
                    </h1>
                    {isPending && <span className="text-xs text-slate-400 font-normal animate-pulse">Updating...</span>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Walking distances calculated from {selectedGate ? `"${selectedGate.name}"` : selectedUniversity.shortName} • Transit guide active • CEB transparent rates
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  {isMockDataActive && (
                    <div className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Kandy Geo-Anchored</span>
                    </div>
                  )}

                  <button
                    onClick={scrollToMap}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline px-2.5 py-1.5"
                  >
                    <span>View Pins on Map</span>
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Target Audience Quick Pills for Kandy */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Target Group:</span>
                {[
                  { id: 'all', label: '🌟 All Kandy Boardings', sinhala: 'සියලුම' },
                  { id: 'campus_student', label: '🎓 Campus Undergrads', sinhala: 'පේරාදෙණිය / UoP' },
                  { id: 'school_student', label: '🎒 School & A/L Tuition', sinhala: 'පාසල් / ටියුෂන්' },
                  { id: 'working_professional', label: '💼 Hospital & Office Workers', sinhala: 'රෝහල් / කාර්යාල' },
                ].map((aud) => {
                  const isActive = audienceFilter === aud.id;
                  return (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => setAudienceFilter(aud.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                      }`}
                    >
                      <span>{aud.label}</span>
                      <span className={`text-[10px] font-normal ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                        ({aud.sinhala})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Full Screen Responsive Card Grid (Up to 5 columns on ultra-wide screens) */}
              {filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {filteredListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      isSelected={selectedListingId === listing.id}
                      isShortlisted={shortlistedListingIds.includes(listing.id)}
                      onSelect={(l) => setSelectedListingId(l.id)}
                      onLocateOnMap={handleLocateOnMap}
                      onToggleShortlist={handleToggleShortlist}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
                  <Compass className="w-14 h-14 mx-auto text-slate-400 mb-3 animate-spin duration-3000" />
                  <h3 className="text-lg font-bold">No Boarding Rooms Found in this Perimeter</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Try expanding the search radius from 1km to 3km or choosing another campus gate.
                  </p>
                  <button
                    onClick={() => {
                      setRadiusMeters(5000);
                      setGenderFilter('any');
                      setRoomTypeFilter('all');
                      setMaxRent(null);
                    }}
                    className="mt-5 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition shadow-md"
                  >
                    Reset Radius to 5.0 km
                  </button>
                </div>
              )}
            </section>

            {/* SECTION 2: LARGE HORIZONTAL MAP PREVIEW (Spanning Full Screen Width) */}
            <section ref={mapSectionRef} className="pt-4 scroll-mt-28 space-y-4">
              {/* Map Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <MapIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Interactive Campus Proximity Map</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {selectedGate ? `${selectedUniversity.shortName} • ${selectedGate.name}` : selectedUniversity.shortName}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Click any price pin on the map to inspect details, or click &ldquo;Map&rdquo; on any card above to pinpoint.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={scrollToTop}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>Back to Rooms</span>
                  </button>
                </div>
              </div>

              {/* Large Full-Width Horizontal Map View with Guaranteed Isolation */}
              <div className="relative isolate z-0 w-full h-[600px] lg:h-[700px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
                <MapContainer
                  listings={filteredListings}
                  activeUniversity={activeAnchor}
                  searchRadiusMeters={radiusMeters}
                  selectedListingId={selectedListingId}
                  onSelectListing={(listing) => {
                    setSelectedListingId(listing.id);
                  }}
                  className="h-full w-full"
                />
              </div>
            </section>
          </>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: BODIM MATCH — ROOMMATE & BATCHMATE FINDER */}
        {/* ========================================================================= */}
        {activeMainTab === 'roommates' && (
          <section className="space-y-6 animate-in fade-in duration-300">
            {/* Bodim Match Header Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold backdrop-blur-md">
                  <Users className="w-3.5 h-3.5" />
                  <span>සහවාසික සෙවුම • Bodim Match Kandy</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Find Compatible Roommates in Kandy & Split Rent
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  Rent full annexes or 2-bedroom apartments across Peradeniya, William Gopallawa, Katugastota, Kundasale, or Kandy City by teaming up with verified students, healthcare staff, and working professionals.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => setIsRoommateModalOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 font-extrabold text-xs sm:text-sm shadow-lg transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-emerald-700" />
                  <span>+ Post Your Profile</span>
                </button>
              </div>
            </div>

            {/* Roommate Results Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{filteredRoommates.length} Student Roommate Profiles Active</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Connect securely via WhatsApp with verified undergraduates searching for roommates
                </p>
              </div>
            </div>

            {/* Roommate Responsive Grid */}
            {filteredRoommates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredRoommates.map((post) => (
                  <RoommateCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
                <Users className="w-14 h-14 mx-auto text-slate-400 mb-3" />
                <h3 className="text-lg font-bold">No Roommate Posts Match Your Filter</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Try clearing the gender or budget ceiling filters to discover batchmates.
                </p>
                <button
                  onClick={() => {
                    setRoommateGenderFilter('any');
                    setRoommateMaxBudget(null);
                  }}
                  className="mt-5 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition shadow-md"
                >
                  Reset Roommate Filters
                </button>
              </div>
            )}
          </section>
        )}

      </main>

      {/* Floating Shortlist Comparison Dock (Feature 4) */}
      <ComparisonFloatingBar
        shortlistedListings={shortlistedListings}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onClearAll={handleClearAllShortlisted}
        universityName={selectedUniversity.name}
        gateName={selectedGate?.name}
      />

      {/* Side-by-Side Comparison Modal (Feature 4) */}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        listings={shortlistedListings}
        onRemoveListing={handleRemoveFromShortlist}
        universityName={selectedUniversity.name}
        gateName={selectedGate?.name}
      />

      {/* Standalone CEB Electricity Bill Calculator Modal (Feature 3) */}
      <CEBCalculatorModal
        isOpen={isCEBCalcModalOpen}
        onClose={() => setIsCEBCalcModalOpen(false)}
      />

      {/* Create Roommate Post Modal (Feature 1) */}
      <CreateRoommatePostModal
        isOpen={isRoommateModalOpen}
        onClose={() => setIsRoommateModalOpen(false)}
        defaultUniversityId={selectedUniversity.id}
        onPostCreated={(newPost) => {
          setRoommates((prev) => [newPost, ...prev]);
        }}
      />

      {/* Landlord 3-Step Mobile-First Listing Wizard */}
      <ListingWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onListingCreated={(newListing) => {
          setListings((prev) => [
            {
              id: 'new-' + Date.now(),
              host_id: 'host-user',
              title: newListing.title,
              description: newListing.description,
              room_type: newListing.room_type,
              gender_preference: newListing.gender_preference,
              monthly_rent: newListing.monthly_rent,
              key_money_months: newListing.key_money_months,
              electricity_type: newListing.electricity_type,
              water_type: newListing.water_type,
              curfew_time: newListing.curfew_time || null,
              has_gate_key: newListing.has_gate_key,
              latitude: activeLat + 0.002,
              longitude: activeLng + 0.002,
              address_text: newListing.address_text || 'Near Campus Gate',
              nearest_landmark: newListing.nearest_landmark || (selectedGate ? selectedGate.name : selectedUniversity.shortName),
              is_available: Boolean(newListing.is_available ?? true),
              images: newListing.photos && newListing.photos.length > 0
                ? newListing.photos
                : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
              created_at: new Date().toISOString(),
              distance_meters: 250,
              host_name: 'You (Verified Landlord)',
              host_phone: '+94771234567',
              host_is_verified: true,
              amenities: {
                has_wifi: true,
                has_attached_bathroom: true,
                cooking_allowed: true,
                has_study_table: true,
                has_bed_and_mattress: true,
                has_washing_machine: true,
              },
              avg_rating: 5.0,
              review_count: 1,
            },
            ...prev,
          ]);
        }}
      />

      {/* Footer - Full Width Responsive */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-xs text-slate-500 dark:text-slate-400 transition-colors w-full">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              B
            </div>
            <span>
              <strong>Bodima.lk (බෝඩිම)</strong> • Sri Lanka’s Localized Boarding & Annex Discovery Platform.
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Zero Hidden Fee Policy</span>
            <span>•</span>
            <span>NIC Host Verification</span>
            <span>•</span>
            <span>CEB Domestic Block Tariff Protection</span>
            <span>•</span>
            <span>OpenStreetMap & PostGIS Powered</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
