// ==============================================================================
// BODIMA (bodima.lk) - TypeScript Domain Models & Database Types
// ==============================================================================

export type RoomType = 'single' | 'shared' | 'annex' | 'bed_seater';
export type GenderPreference = 'male' | 'female' | 'any';
export type UtilityBillingType = 'separate_meter' | 'split_bill' | 'included';

export interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  is_landlord: boolean;
  is_verified: boolean;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Amenities {
  has_wifi: boolean;
  has_attached_bathroom: boolean;
  cooking_allowed: boolean;
  has_study_table: boolean;
  has_bed_and_mattress: boolean;
  has_washing_machine: boolean;
}

export interface TransitInfo {
  bus_routes: string[];
  nearest_bus_stop: string;
  bus_stop_distance_meters: number;
  walk_to_stop_mins: number;
  campus_commute: {
    walk_mins: number;
    bus_mins: number;
    tuktuk_mins: number;
    tuktuk_fare_est: number;
  };
}

export interface Listing {
  id: string;
  host_id: string;
  title: string;
  description?: string;
  room_type: RoomType;
  gender_preference: GenderPreference;
  monthly_rent: number;
  key_money_months: number;
  electricity_type: UtilityBillingType;
  water_type: UtilityBillingType;
  curfew_time?: string | null; // e.g. "22:00:00"
  has_gate_key: boolean;
  latitude: number;
  longitude: number;
  address_text: string;
  nearest_landmark?: string | null;
  is_available: boolean;
  images: string[];
  created_at: string;
  
  // PostGIS RPC computed fields
  distance_meters?: number;
  host_name?: string;
  host_phone?: string;
  host_is_verified?: boolean;
  amenities?: Amenities;
  avg_rating?: number;
  review_count?: number;

  // Sri Lankan Bus & Transit Proximity
  transit_info?: TransitInfo;

  // Kandy Specific Student & Worker Attributes
  target_audience?: 'campus_student' | 'school_student' | 'working_professional' | 'all';
  has_meals_option?: boolean; // True for Kandy student homes providing බත් පැකට් / කෑම
  curfew_note?: string; // e.g. "8:00 PM for school students" or "24/7 Gate Key for Hospital Staff"
}

export interface RoommatePost {
  id: string;
  student_name: string;
  avatar_url: string;
  gender: 'male' | 'female';
  university_id: string;
  university_name: string;
  faculty: string;
  academic_year: string;
  budget_per_person: number;
  preferred_locations: string[];
  target_room_type: RoomType | 'any';
  needed_roommates_count: number;
  lifestyle_tags: string[];
  study_habit: string;
  bio: string;
  phone_number: string;
  is_verified_student: boolean;
  created_at: string;
}

export interface CEBApplianceItem {
  id: string;
  name: string;
  sinhalaName: string;
  iconName: string;
  watts: number;
  typicalDailyHours: number;
  unitsPerMonth: number;
  quantity: number;
}

export interface CEBTariffCalculation {
  totalUnits: number;
  unitCostTotal: number;
  fixedCharge: number;
  totalMonthlyBill: number;
  effectiveRatePerUnit: number;
  tierName: string;
  tierSinhala: string;
  savingsTips: string[];
}

export interface BodimSearchParams {
  user_lat: number;
  user_lng: number;
  radius_meters?: number; // Default: 5000 (5km)
  max_rent?: number | null;
  gender_pref?: GenderPreference | null;
  room_types?: RoomType[] | null;
  sort_by?: 'distance_asc' | 'price_asc' | 'price_desc' | 'rating_desc';
}

export interface CampusGate {
  id: string;
  name: string;
  sinhalaName: string;
  latitude: number;
  longitude: number;
  facultiesNearby: string;
  landmarkDescription?: string;
}

export interface UniversityAnchor {
  id: string;
  name: string;
  sinhalaName: string;
  tamilName: string;
  shortName: string;
  city: string;
  latitude: number;
  longitude: number;
  defaultRadiusMeters: number;
  landmarks: string[];
  gates: CampusGate[];
}

