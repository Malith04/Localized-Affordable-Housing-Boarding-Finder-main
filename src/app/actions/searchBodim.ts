'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { BodimSearchParams, Listing } from '@/types/bodima';
import { calculateHaversineDistance, generateGeoAnchoredMockListings } from '@/lib/mock/mockListings';

/**
 * Server Action: searchNearbyBodimAction
 * Calls the Supabase PostGIS RPC function `search_nearby_bodim`
 * Supports fallback sorting and offline mock fallback.
 */
export async function searchNearbyBodimAction(
  params: BodimSearchParams
): Promise<{ success: boolean; data: Listing[]; error?: string; isMock?: boolean }> {
  try {
    const {
      user_lat,
      user_lng,
      radius_meters = 5000,
      max_rent = null,
      gender_pref = null,
      room_types = null,
      sort_by = 'distance_asc',
    } = params;

    // Validate inputs
    if (typeof user_lat !== 'number' || typeof user_lng !== 'number') {
      return { success: false, data: [], error: 'Valid latitude and longitude coordinates are required.' };
    }

    const supabase = createServerSupabaseClient();

    let listings: Listing[] = [];
    let isMock = false;

    if (supabase) {
      try {
        // 1200ms timeout race to prevent network hang if Supabase is unreachable/paused
        const rpcPromise = supabase.rpc('search_nearby_bodim', {
          user_lat,
          user_lng,
          radius_meters,
          max_rent: max_rent ?? null,
          gender_pref: gender_pref && gender_pref !== 'any' ? gender_pref : null,
          room_types: room_types && room_types.length > 0 ? room_types : null,
        });

        const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: { message: 'Database request timed out' } }), 1200)
        );

        const result: any = await Promise.race([rpcPromise, timeoutPromise]);

        if (result?.error) {
          console.warn('PostGIS RPC query failed, activating offline preview:', result.error.message);
          isMock = true;
        } else if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
          listings = result.data as Listing[];
        } else {
          // If DB is empty (tables created but not seeded yet), fall back to sample listings
          isMock = true;
        }
      } catch (dbErr: any) {
        console.warn('Supabase connection error, engaging mock data:', dbErr?.message);
        isMock = true;
      }
    } else {
      isMock = true;
    }

    // If Supabase is offline or empty, use realistic geo-anchored listings
    if (isMock || listings.length === 0) {
      isMock = true;
      const dynamicListings = generateGeoAnchoredMockListings(user_lat, user_lng);
      listings = dynamicListings.map((item) => {
        const dist = calculateHaversineDistance(user_lat, user_lng, item.latitude, item.longitude);
        return {
          ...item,
          distance_meters: dist,
        };
      }).filter((item) => {
        // If within campus proximity or reasonable radius
        if (item.distance_meters > Math.max(radius_meters, 8000)) return false;
        // Rent filter
        if (max_rent && item.monthly_rent > max_rent) return false;
        // Gender filter
        if (gender_pref && gender_pref !== 'any' && item.gender_preference !== 'any' && item.gender_preference !== gender_pref) {
          return false;
        }
        // Room type filter
        if (room_types && room_types.length > 0 && !room_types.includes(item.room_type)) {
          return false;
        }
        return true;
      });

      // If strict radius filtered everything out in preview, show closest 2 places with updated distance
      if (listings.length === 0) {
        listings = dynamicListings.slice(0, 2);
      }
    }

    // Apply sorting
    listings.sort((a, b) => {
      switch (sort_by) {
        case 'price_asc':
          return a.monthly_rent - b.monthly_rent;
        case 'price_desc':
          return b.monthly_rent - a.monthly_rent;
        case 'rating_desc':
          return (b.avg_rating ?? 0) - (a.avg_rating ?? 0);
        case 'distance_asc':
        default:
          return (a.distance_meters ?? 0) - (b.distance_meters ?? 0);
      }
    });

    return {
      success: true,
      data: listings,
      isMock,
    };
  } catch (err: unknown) {
    // Even in total catch block, return mock listings instead of empty screen
    return {
      success: true,
      data: generateGeoAnchoredMockListings(params.user_lat || 6.7969, params.user_lng || 79.9018),
      isMock: true,
    };
  }
}
