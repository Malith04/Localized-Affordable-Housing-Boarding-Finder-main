import { Listing, TransitInfo } from '@/types/bodima';

/**
 * Calculates Haversine distance in meters between two lat/long points.
 */
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Returns localized Kandy bus & transit routes according to destination hub coordinates.
 */
function getLocalizedTransitInfo(baseLat: number, offsetMeters: number): TransitInfo {
  // 1. Peradeniya Campus & Galaha Corridor (~7.25 N)
  if (Math.abs(baseLat - 7.255) < 0.02) {
    return {
      bus_routes: ['654 (Kandy-Peradeniya)', '724 (Galaha)', '725 (Deltota)', 'Sarasavi Uyana Train'],
      nearest_bus_stop: 'Galaha Junction / Sarasavi Uyana Station Bus Halt',
      bus_stop_distance_meters: 160 + (offsetMeters % 140),
      walk_to_stop_mins: Math.max(2, Math.round((160 + (offsetMeters % 140)) / 75)),
      campus_commute: {
        walk_mins: Math.round(offsetMeters / 75),
        bus_mins: 4,
        tuktuk_mins: 2,
        tuktuk_fare_est: 150 + Math.round((offsetMeters / 1000) * 80),
      },
    };
  }

  // 2. William Gopallawa & Tuition / Schools Strip (~7.288 N)
  if (Math.abs(baseLat - 7.288) < 0.015) {
    return {
      bus_routes: ['654 (Peradeniya Shuttle)', '01 (Colombo-Kandy)', 'Goodshed Bus Terminal', 'Kandy Station Train'],
      nearest_bus_stop: 'William Gopallawa Apex/Rotary Tuition Bus Halt',
      bus_stop_distance_meters: 120 + (offsetMeters % 150),
      walk_to_stop_mins: Math.max(2, Math.round((120 + (offsetMeters % 150)) / 75)),
      campus_commute: {
        walk_mins: Math.round(offsetMeters / 75),
        bus_mins: 3,
        tuktuk_mins: 2,
        tuktuk_fare_est: 120 + Math.round((offsetMeters / 1000) * 80),
      },
    };
  }

  // 3. Kandy National Hospital & Katukele (~7.287 N, 80.634 E)
  if (Math.abs(baseLat - 7.2875) < 0.01) {
    return {
      bus_routes: ['654 (Peradeniya Rd)', '633 (Ampitiya)', 'Hospital Road Shuttle'],
      nearest_bus_stop: 'National Hospital Kandy Casualty Halt',
      bus_stop_distance_meters: 140 + (offsetMeters % 120),
      walk_to_stop_mins: Math.max(2, Math.round((140 + (offsetMeters % 120)) / 75)),
      campus_commute: {
        walk_mins: Math.round(offsetMeters / 75),
        bus_mins: 3,
        tuktuk_mins: 2,
        tuktuk_fare_est: 120 + Math.round((offsetMeters / 1000) * 80),
      },
    };
  }

  // 4. Katugastota & North Kandy (~7.324 N)
  if (Math.abs(baseLat - 7.324) < 0.02) {
    return {
      bus_routes: ['621 (Kurunegala)', '593 (Matale)', '544 (Galagedara)', '654 (Town Shuttle)'],
      nearest_bus_stop: 'Katugastota Bridge / St. Anthonys Halt',
      bus_stop_distance_meters: 180 + (offsetMeters % 150),
      walk_to_stop_mins: Math.max(2, Math.round((180 + (offsetMeters % 150)) / 75)),
      campus_commute: {
        walk_mins: Math.round(offsetMeters / 75),
        bus_mins: 5,
        tuktuk_mins: 3,
        tuktuk_fare_est: 160 + Math.round((offsetMeters / 1000) * 90),
      },
    };
  }

  // 5. Kundasale & Pallekele BOI (~7.283 N, 80.702 E)
  if (Math.abs(baseLat - 7.283) < 0.02) {
    return {
      bus_routes: ['604 (Kandy-Digana)', '603 (Teldeniya-Mahiyanganaya)', '628 (Pallekele BOI)'],
      nearest_bus_stop: 'Pallekele BOI Industrial Zone Main Halt',
      bus_stop_distance_meters: 150 + (offsetMeters % 180),
      walk_to_stop_mins: Math.max(2, Math.round((150 + (offsetMeters % 180)) / 75)),
      campus_commute: {
        walk_mins: Math.round(offsetMeters / 75),
        bus_mins: 5,
        tuktuk_mins: 3,
        tuktuk_fare_est: 150 + Math.round((offsetMeters / 1000) * 90),
      },
    };
  }

  // Default Central Province bus route fallback
  return {
    bus_routes: ['Route 654 (Kandy-Peradeniya)', 'Central Province Inter-District'],
    nearest_bus_stop: 'Kandy Main Road Bus Halt',
    bus_stop_distance_meters: 200,
    walk_to_stop_mins: 3,
    campus_commute: {
      walk_mins: Math.round(offsetMeters / 75),
      bus_mins: 5,
      tuktuk_mins: 3,
      tuktuk_fare_est: 150,
    },
  };
}

/**
 * Dynamically creates realistic Kandy boarding listings clustered around
 * the selected destination hub and entrance gate coordinates.
 */
export function generateGeoAnchoredMockListings(baseLat: number, baseLng: number): Listing[] {
  return [
    {
      id: 'kandy-1-' + baseLat.toFixed(3),
      host_id: 'host-kandy-1',
      title: 'Peradeniya Sarasavi Uyana — 2-Bed Boys Study House (Walking to Eng Gate)',
      description: 'Ideal for UoP Engineering, Science or Agriculture undergraduates. Peaceful residential lane just 4 mins walk to Sarasavi Uyana train halt and Akbar bridge. Furnished with individual study tables, SLT high-speed fiber WiFi, ceiling fan, and secure bicycle parking.',
      room_type: 'shared',
      gender_preference: 'male',
      monthly_rent: 11500,
      key_money_months: 1,
      electricity_type: 'separate_meter',
      water_type: 'included',
      curfew_time: null,
      has_gate_key: true,
      latitude: baseLat + 0.0022,
      longitude: baseLng + 0.0018,
      address_text: 'Sarasavi Uyana Station Road, Peradeniya',
      nearest_landmark: 'Sarasavi Uyana Railway Halt & Akbar Bridge (280m)',
      is_available: true,
      images: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
      ],
      created_at: new Date().toISOString(),
      distance_meters: 280,
      host_name: 'Mr. Gamini Bandara (Retired UoP Staff)',
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
      avg_rating: 4.9,
      review_count: 14,
      transit_info: getLocalizedTransitInfo(baseLat, 280),
      target_audience: 'campus_student',
      has_meals_option: false,
      curfew_note: 'No curfew. Individual gate key provided for late library/lab study.',
    },
    {
      id: 'kandy-2-' + baseLat.toFixed(3),
      host_id: 'host-kandy-2',
      title: 'William Gopallawa — Secure Girls Study Room (Meals Option / කෑම සහිතයි)',
      description: 'Specially managed for A/L Tuition Students (Apex, Rotary, Synergy) and National School students. Strict security with respectable landlady living on ground floor. Home-cooked nutritious lunch & dinner provided on request. Quiet environment for intense exam preparation.',
      room_type: 'single',
      gender_preference: 'female',
      monthly_rent: 15000,
      key_money_months: 1,
      electricity_type: 'split_bill',
      water_type: 'included',
      curfew_time: '20:00:00',
      has_gate_key: false,
      latitude: baseLat - 0.0018,
      longitude: baseLng + 0.0015,
      address_text: 'William Gopallawa Mawatha, Kandy',
      nearest_landmark: 'Apex & Rotary A/L Tuition Complexes (180m)',
      is_available: true,
      images: [
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
      ],
      created_at: new Date().toISOString(),
      distance_meters: 220,
      host_name: 'Mrs. Pushpa Jayasundara',
      host_phone: '+94718901234',
      host_is_verified: true,
      amenities: {
        has_wifi: true,
        has_attached_bathroom: false,
        cooking_allowed: false,
        has_study_table: true,
        has_bed_and_mattress: true,
        has_washing_machine: false,
      },
      avg_rating: 4.8,
      review_count: 19,
      transit_info: getLocalizedTransitInfo(baseLat, 220),
      target_audience: 'school_student',
      has_meals_option: true,
      curfew_note: '8:00 PM curfew for school and tuition student safety. Warden presence.',
    },
    {
      id: 'kandy-3-' + baseLat.toFixed(3),
      host_id: 'host-kandy-3',
      title: 'Katukele — Private Studio Annex (Walking to Kandy National Hospital)',
      description: 'Self-contained studio annex with private entrance, pantry, and attached bathroom. Tailored for Intern Medical Officers, Doctors, Pharmacists, and Healthcare Professionals. 24/7 unhindered in/out access for hospital emergency and night-on-call shifts. Quiet daytime rest guaranteed.',
      room_type: 'annex',
      gender_preference: 'any',
      monthly_rent: 28000,
      key_money_months: 2,
      electricity_type: 'separate_meter',
      water_type: 'separate_meter',
      curfew_time: null,
      has_gate_key: true,
      latitude: baseLat + 0.0028,
      longitude: baseLng - 0.0022,
      address_text: 'Hospital Road, Katukele, Kandy',
      nearest_landmark: 'Kandy National Hospital Casualty Gate (240m)',
      is_available: true,
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      ],
      created_at: new Date().toISOString(),
      distance_meters: 240,
      host_name: 'Dr. Chandra Weerakoon',
      host_phone: '+94765432109',
      host_is_verified: true,
      amenities: {
        has_wifi: true,
        has_attached_bathroom: true,
        cooking_allowed: true,
        has_study_table: true,
        has_bed_and_mattress: true,
        has_washing_machine: true,
      },
      avg_rating: 4.9,
      review_count: 11,
      transit_info: getLocalizedTransitInfo(baseLat, 240),
      target_audience: 'working_professional',
      has_meals_option: false,
      curfew_note: 'Unrestricted 24/7 gate access with dedicated private key for hospital shifts.',
    },
    {
      id: 'kandy-4-' + baseLat.toFixed(3),
      host_id: 'host-kandy-4',
      title: 'Galaha Road — Affordable Girls Shared Bodima (Near UoP Arts & Senate)',
      description: 'Budget-friendly shared room for female university undergraduates. Located along picturesque Galaha road with continuous bus connectivity (Route 654/724). Safe gated boundary, clean drinking water filter, and shared study hall.',
      room_type: 'shared',
      gender_preference: 'female',
      monthly_rent: 7500,
      key_money_months: 1,
      electricity_type: 'split_bill',
      water_type: 'included',
      curfew_time: '21:30:00',
      has_gate_key: true,
      latitude: baseLat - 0.0035,
      longitude: baseLng - 0.0020,
      address_text: 'Galaha Road, Peradeniya',
      nearest_landmark: 'Galaha Junction & Royal Botanical Gardens (380m)',
      is_available: true,
      images: [
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
      ],
      created_at: new Date().toISOString(),
      distance_meters: 380,
      host_name: 'Anula Kumarihamy',
      host_phone: '+94723456789',
      host_is_verified: true,
      amenities: {
        has_wifi: true,
        has_attached_bathroom: false,
        cooking_allowed: true,
        has_study_table: true,
        has_bed_and_mattress: true,
        has_washing_machine: false,
      },
      avg_rating: 4.6,
      review_count: 8,
      transit_info: getLocalizedTransitInfo(baseLat, 380),
      target_audience: 'campus_student',
      has_meals_option: true,
      curfew_note: '9:30 PM curfew. Safe residential neighborhood with street lighting.',
    },
    {
      id: 'kandy-5-' + baseLat.toFixed(3),
      host_id: 'host-kandy-5',
      title: 'Kundasale / Pallekele — Modern 2-Bedroom Annex (Near BOI & SIBA)',
      description: 'Newly constructed upstairs annex with modern tiled floors, panoramic view of Knuckles mountain range, full kitchen, and balcony. Highly recommended for BOI apparel executives, IT engineers, SIBA campus lecturers, or bank officers. Secure car/bike porch.',
      room_type: 'annex',
      gender_preference: 'any',
      monthly_rent: 32000,
      key_money_months: 2,
      electricity_type: 'separate_meter',
      water_type: 'separate_meter',
      curfew_time: null,
      has_gate_key: true,
      latitude: baseLat + 0.0045,
      longitude: baseLng + 0.0035,
      address_text: 'Balagolla Road, Kundasale / Pallekele',
      nearest_landmark: 'Pallekele BOI Export Zone & SIBA Campus (520m)',
      is_available: true,
      images: [
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      ],
      created_at: new Date().toISOString(),
      distance_meters: 520,
      host_name: 'Nalin Alahakoon (Chartered Engineer)',
      host_phone: '+94701122334',
      host_is_verified: true,
      amenities: {
        has_wifi: true,
        has_attached_bathroom: true,
        cooking_allowed: true,
        has_study_table: true,
        has_bed_and_mattress: true,
        has_washing_machine: true,
      },
      avg_rating: 4.9,
      review_count: 17,
      transit_info: getLocalizedTransitInfo(baseLat, 520),
      target_audience: 'working_professional',
      has_meals_option: false,
      curfew_note: 'Completely independent access with private remote gate control.',
    },
    {
      id: 'kandy-6-' + baseLat.toFixed(3),
      host_id: 'host-kandy-6',
      title: 'Katugastota — Peaceful Study Room for St. Anthonys / Rahula Students',
      description: 'Calm, breezy room overlooking Mahaweli riverbank near St. Anthonys and Sri Rahula College. Ideal for school students and teachers. Single bed, large desk, and meals provided by warm Sinhala Buddhist family.',
      room_type: 'single',
      gender_preference: 'male',
      monthly_rent: 13500,
      key_money_months: 1,
      electricity_type: 'split_bill',
      water_type: 'included',
      curfew_time: '20:30:00',
      has_gate_key: false,
      latitude: baseLat - 0.0022,
      longitude: baseLng - 0.0031,
      address_text: 'Gohagoda Road, Katugastota, Kandy',
      nearest_landmark: 'St. Anthonys College & Katugastota Bridge (340m)',
      is_available: true,
      images: [
        'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
      ],
      created_at: new Date().toISOString(),
      distance_meters: 340,
      host_name: 'Sunil Wickramasinghe',
      host_phone: '+94789988776',
      host_is_verified: true,
      amenities: {
        has_wifi: true,
        has_attached_bathroom: true,
        cooking_allowed: false,
        has_study_table: true,
        has_bed_and_mattress: true,
        has_washing_machine: false,
      },
      avg_rating: 4.7,
      review_count: 9,
      transit_info: getLocalizedTransitInfo(baseLat, 340),
      target_audience: 'school_student',
      has_meals_option: true,
      curfew_note: '8:30 PM curfew. Wholesome home-cooked food and family guidance.',
    },
  ];
}
