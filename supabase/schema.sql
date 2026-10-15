-- ==============================================================================
-- BODIMA (bodima.lk) - Complete Supabase & PostGIS Database Schema
-- Hyper-localized Boarding Room & Annex Discovery Platform (Sri Lanka)
-- ==============================================================================

-- 1. EXTENSIONS
-- PostGIS for geospatial queries & uuid-ossp for cryptographic identifiers
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure search path includes extensions schema
ALTER DATABASE postgres SET search_path TO public, extensions;

-- ==============================================================================
-- 2. CUSTOM TYPES / ENUMS
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE room_type AS ENUM ('single', 'shared', 'annex', 'bed_seater');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gender_preference AS ENUM ('male', 'female', 'any');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE utility_billing_type AS ENUM ('separate_meter', 'split_bill', 'included');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. PROFILES TABLE
-- Extends Supabase auth.users with local Sri Lankan landlord/student attributes
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL, -- e.g. +94771234567 or 0771234567
    is_landlord BOOLEAN NOT NULL DEFAULT false,
    is_verified BOOLEAN NOT NULL DEFAULT false, -- Sri Lankan NIC / Grama Niladhari check
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. LISTINGS TABLE
-- Core boarding/annex entity with PostGIS spatial geography point
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    room_type room_type NOT NULL DEFAULT 'single',
    gender_preference gender_preference NOT NULL DEFAULT 'any',
    
    -- Financials (in Sri Lankan Rupees - LKR)
    monthly_rent NUMERIC(10, 2) NOT NULL CHECK (monthly_rent > 0),
    key_money_months INTEGER NOT NULL DEFAULT 1 CHECK (key_money_months >= 0),
    
    -- Utility Policies (Zero hidden fees)
    electricity_type utility_billing_type NOT NULL DEFAULT 'split_bill',
    water_type utility_billing_type NOT NULL DEFAULT 'included',
    
    -- House Rules & Accessibility
    curfew_time TIME, -- NULL implies no curfew
    has_gate_key BOOLEAN NOT NULL DEFAULT true,
    
    -- Geospatial (PostGIS WGS 84 Geography Point)
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address_text TEXT NOT NULL,
    nearest_landmark TEXT, -- e.g. "50m to Moratuwa University Back Gate"
    
    -- Status & Media
    is_available BOOLEAN NOT NULL DEFAULT true,
    images TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Spatial GIST index for rapid ST_DWithin geospatial filtering
CREATE INDEX IF NOT EXISTS listings_location_gist ON public.listings USING GIST (location);

-- B-Tree indexes for frequent queries
CREATE INDEX IF NOT EXISTS listings_host_id_idx ON public.listings (host_id);
CREATE INDEX IF NOT EXISTS listings_availability_rent_idx ON public.listings (is_available, monthly_rent);
CREATE INDEX IF NOT EXISTS listings_room_gender_idx ON public.listings (room_type, gender_preference);

-- ==============================================================================
-- 5. AMENITIES TABLE (1-to-1 with listings)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL UNIQUE REFERENCES public.listings(id) ON DELETE CASCADE,
    has_wifi BOOLEAN NOT NULL DEFAULT false,
    has_attached_bathroom BOOLEAN NOT NULL DEFAULT false,
    cooking_allowed BOOLEAN NOT NULL DEFAULT false,
    has_study_table BOOLEAN NOT NULL DEFAULT false,
    has_bed_and_mattress BOOLEAN NOT NULL DEFAULT false,
    has_washing_machine BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS amenities_listing_id_idx ON public.amenities (listing_id);

-- ==============================================================================
-- 6. REVIEWS & RATINGS TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_tenant_listing_review UNIQUE (listing_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS reviews_listing_id_idx ON public.reviews (listing_id);

-- ==============================================================================
-- 7. POSTGIS RPC FUNCTION: search_nearby_bodim
-- Native PostgreSQL function executing spatial query with ST_DWithin and ST_Distance
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.search_nearby_bodim(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION DEFAULT 5000,
    max_rent NUMERIC DEFAULT NULL,
    gender_pref TEXT DEFAULT NULL,
    room_types TEXT[] DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    host_id UUID,
    title TEXT,
    description TEXT,
    room_type room_type,
    gender_preference gender_preference,
    monthly_rent NUMERIC,
    key_money_months INTEGER,
    electricity_type utility_billing_type,
    water_type utility_billing_type,
    curfew_time TIME,
    has_gate_key BOOLEAN,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address_text TEXT,
    nearest_landmark TEXT,
    is_available BOOLEAN,
    images TEXT[],
    created_at TIMESTAMPTZ,
    distance_meters DOUBLE PRECISION,
    host_name TEXT,
    host_phone TEXT,
    host_is_verified BOOLEAN,
    amenities JSONB,
    avg_rating NUMERIC,
    review_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    search_point GEOGRAPHY;
BEGIN
    -- Construct PostGIS geography point from longitude and latitude (WGS 84 SRID 4326)
    search_point := ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography;

    RETURN QUERY
    SELECT 
        l.id,
        l.host_id,
        l.title,
        l.description,
        l.room_type,
        l.gender_preference,
        l.monthly_rent,
        l.key_money_months,
        l.electricity_type,
        l.water_type,
        l.curfew_time,
        l.has_gate_key,
        ST_Y(l.location::geometry) AS latitude,
        ST_X(l.location::geometry) AS longitude,
        l.address_text,
        l.nearest_landmark,
        l.is_available,
        l.images,
        l.created_at,
        ROUND(ST_Distance(l.location, search_point)::numeric, 1)::double precision AS distance_meters,
        p.full_name AS host_name,
        p.phone_number AS host_phone,
        p.is_verified AS host_is_verified,
        COALESCE(
            jsonb_build_object(
                'has_wifi', a.has_wifi,
                'has_attached_bathroom', a.has_attached_bathroom,
                'cooking_allowed', a.cooking_allowed,
                'has_study_table', a.has_study_table,
                'has_bed_and_mattress', a.has_bed_and_mattress,
                'has_washing_machine', a.has_washing_machine
            ),
            '{}'::jsonb
        ) AS amenities,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0.0) AS avg_rating,
        COUNT(r.id)::bigint AS review_count
    FROM 
        public.listings l
    INNER JOIN 
        public.profiles p ON l.host_id = p.id
    LEFT JOIN 
        public.amenities a ON l.id = a.listing_id
    LEFT JOIN 
        public.reviews r ON l.id = r.listing_id
    WHERE 
        l.is_available = true
        -- GIST spatial index condition
        AND ST_DWithin(l.location, search_point, radius_meters)
        -- Optional Filters
        AND (max_rent IS NULL OR l.monthly_rent <= max_rent)
        AND (
            gender_pref IS NULL 
            OR gender_pref = 'any' 
            OR l.gender_preference = gender_pref::gender_preference 
            OR l.gender_preference = 'any'
        )
        AND (
            room_types IS NULL 
            OR cardinality(room_types) = 0 
            OR l.room_type = ANY(room_types::room_type[])
        )
    GROUP BY 
        l.id, p.id, a.id
    ORDER BY 
        distance_meters ASC;
END;
$$;

-- Grant execution permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.search_nearby_bodim TO anon, authenticated;

-- ==============================================================================
-- 8. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Profiles Policies
-- ------------------------------------------------------------------------------
-- Anyone can view landlord profiles
CREATE POLICY "Public can view landlord profiles"
    ON public.profiles FOR SELECT
    USING (true);

-- Users can insert their own profile upon signup
CREATE POLICY "Users can create their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- Listings Policies
-- ------------------------------------------------------------------------------
-- Public can view active listings; Hosts can view all their own listings (even inactive)
CREATE POLICY "Public can view available listings"
    ON public.listings FOR SELECT
    USING (is_available = true OR auth.uid() = host_id);

-- Landlords can insert listings
CREATE POLICY "Hosts can insert their own listings"
    ON public.listings FOR INSERT
    WITH CHECK (auth.uid() = host_id);

-- Hosts can update only their own listings
CREATE POLICY "Hosts can update their own listings"
    ON public.listings FOR UPDATE
    USING (auth.uid() = host_id)
    WITH CHECK (auth.uid() = host_id);

-- Hosts can delete their own listings
CREATE POLICY "Hosts can delete their own listings"
    ON public.listings FOR DELETE
    USING (auth.uid() = host_id);

-- ------------------------------------------------------------------------------
-- Amenities Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Public can view amenities of accessible listings"
    ON public.amenities FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.listings l 
            WHERE l.id = amenities.listing_id 
            AND (l.is_available = true OR l.host_id = auth.uid())
        )
    );

CREATE POLICY "Hosts can manage amenities for their listings"
    ON public.amenities FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.listings l 
            WHERE l.id = amenities.listing_id 
            AND l.host_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- Reviews Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Public can read reviews"
    ON public.reviews FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can leave reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (
        auth.uid() = tenant_id 
        AND NOT EXISTS (
            -- Prevent landlords from reviewing their own place
            SELECT 1 FROM public.listings l 
            WHERE l.id = reviews.listing_id 
            AND l.host_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own reviews"
    ON public.reviews FOR UPDATE
    USING (auth.uid() = tenant_id)
    WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Users can delete their own reviews"
    ON public.reviews FOR DELETE
    USING (auth.uid() = tenant_id);

-- ==============================================================================
-- 9. USER SIGNUP TRIGGER (Automatically create public profile row)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone_number, is_landlord, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Bodima User'),
        COALESCE(new.raw_user_meta_data->>'phone_number', ''),
        COALESCE((new.raw_user_meta_data->>'is_landlord')::boolean, false),
        COALESCE(new.raw_user_meta_data->>'avatar_url', NULL)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 10. REALISTIC SEED DATA (Sri Lankan University Clusters)
-- Sample entries around Moratuwa (UoM), Colombo (UoC), and Malabe (SLIIT)
-- ==============================================================================

-- Note: In Supabase, dummy profile entries can be seeded for demo/local testing.
DO $$
DECLARE
    host1_id UUID := '00000000-0000-0000-0000-000000000001'::uuid;
    host2_id UUID := '00000000-0000-0000-0000-000000000002'::uuid;
    host3_id UUID := '00000000-0000-0000-0000-000000000003'::uuid;
    list1_id UUID := '11111111-1111-1111-1111-111111111111'::uuid;
    list2_id UUID := '22222222-2222-2222-2222-222222222222'::uuid;
    list3_id UUID := '33333333-3333-3333-3333-333333333333'::uuid;
    list4_id UUID := '44444444-4444-4444-4444-444444444444'::uuid;
BEGIN
    -- Seed mock profiles (ignore if foreign key to auth.users is enforced without auth users)
    BEGIN
        INSERT INTO public.profiles (id, full_name, phone_number, is_landlord, is_verified)
        VALUES 
            (host1_id, 'K. G. Jayasinghe', '+94771234567', true, true),
            (host2_id, 'Sunethra Perera', '+94718901234', true, true),
            (host3_id, 'Gamini Wickramasinghe', '+94765432109', true, false)
        ON CONFLICT (id) DO NOTHING;

        -- Listing 1: University of Moratuwa - Katubedda (350m from gate)
        INSERT INTO public.listings (
            id, host_id, title, description, room_type, gender_preference,
            monthly_rent, key_money_months, electricity_type, water_type,
            curfew_time, has_gate_key, location, address_text, nearest_landmark,
            is_available, images
        ) VALUES (
            list1_id, host1_id,
            'Premium Single Study Room near UoM Back Gate',
            'Quiet and breezy room in Molpe road, 4 mins walking distance to University of Moratuwa back gate. Furnished with desk, high-speed fiber internet, and ceiling fan.',
            'single', 'male',
            18500.00, 1, 'separate_meter', 'included',
            NULL, true,
            ST_SetSRID(ST_MakePoint(79.9015, 6.7972), 4326)::geography,
            'No. 42, Molpe Road, Katubedda, Moratuwa',
            'UoM Back Gate (350m)',
            true,
            ARRAY[
                'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80'
            ]
        ) ON CONFLICT (id) DO NOTHING;

        -- Amenities for Listing 1
        INSERT INTO public.amenities (listing_id, has_wifi, has_attached_bathroom, cooking_allowed, has_study_table, has_bed_and_mattress, has_washing_machine)
        VALUES (list1_id, true, true, false, true, true, true)
        ON CONFLICT (listing_id) DO NOTHING;

        -- Listing 2: SLIIT Malabe Campus - Pittugala
        INSERT INTO public.listings (
            id, host_id, title, description, room_type, gender_preference,
            monthly_rent, key_money_months, electricity_type, water_type,
            curfew_time, has_gate_key, location, address_text, nearest_landmark,
            is_available, images
        ) VALUES (
            list2_id, host2_id,
            'Modern 2-Bed Shared Annex for SLIIT / Horizon Students',
            'Fully tiled upstairs annex with separate entrance. Walking distance to SLIIT main entrance and Pittugala junction. Includes pantry cupboard and study spaces.',
            'shared', 'female',
            12000.00, 2, 'split_bill', 'included',
            '22:00:00', true,
            ST_SetSRID(ST_MakePoint(79.9723, 6.9147), 4326)::geography,
            '18/A, Chandrika Kumaratunga Mawatha, Malabe',
            'SLIIT Main Gate (450m)',
            true,
            ARRAY[
                'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'
            ]
        ) ON CONFLICT (id) DO NOTHING;

        -- Amenities for Listing 2
        INSERT INTO public.amenities (listing_id, has_wifi, has_attached_bathroom, cooking_allowed, has_study_table, has_bed_and_mattress, has_washing_machine)
        VALUES (list2_id, true, false, true, true, true, false)
        ON CONFLICT (listing_id) DO NOTHING;

        -- Listing 3: University of Colombo - Reid Avenue / Havelock
        INSERT INTO public.listings (
            id, host_id, title, description, room_type, gender_preference,
            monthly_rent, key_money_months, electricity_type, water_type,
            curfew_time, has_gate_key, location, address_text, nearest_landmark,
            is_available, images
        ) VALUES (
            list3_id, host1_id,
            'Private Studio Annex for Colombo Interns & Med Students',
            'Independent compact annex with kitchenette, attached washroom, and direct road access. 5 mins walk to Colombo University Science faculty and National Hospital shuttle.',
            'annex', 'any',
            32000.00, 3, 'separate_meter', 'separate_meter',
            NULL, true,
            ST_SetSRID(ST_MakePoint(79.8601, 6.9025), 4326)::geography,
            '74, Reid Avenue, Colombo 07',
            'Royal College Grounds / UoC Science Faculty',
            true,
            ARRAY[
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
            ]
        ) ON CONFLICT (id) DO NOTHING;

        -- Amenities for Listing 3
        INSERT INTO public.amenities (listing_id, has_wifi, has_attached_bathroom, cooking_allowed, has_study_table, has_bed_and_mattress, has_washing_machine)
        VALUES (list3_id, true, true, true, true, true, true)
        ON CONFLICT (listing_id) DO NOTHING;

        -- Listing 4: University of Sri Jayewardenepura - Wijerama
        INSERT INTO public.listings (
            id, host_id, title, description, room_type, gender_preference,
            monthly_rent, key_money_months, electricity_type, water_type,
            curfew_time, has_gate_key, location, address_text, nearest_landmark,
            is_available, images
        ) VALUES (
            list4_id, host3_id,
            'Affordable Bed-Seater Room at Wijerama Junction (J’pura)',
            'Budget-friendly room ideal for management/arts students. 10 mins walk to USJ main gate. Strict curfew for safety.',
            'bed_seater', 'female',
            9500.00, 1, 'split_bill', 'included',
            '21:30:00', false,
            ST_SetSRID(ST_MakePoint(79.9070, 6.8530), 4326)::geography,
            '102, Soratha Mawatha, Gangodawila, Nugegoda',
            'USJ Soratha Building (500m)',
            true,
            ARRAY[
                'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'
            ]
        ) ON CONFLICT (id) DO NOTHING;

        -- Amenities for Listing 4
        INSERT INTO public.amenities (listing_id, has_wifi, has_attached_bathroom, cooking_allowed, has_study_table, has_bed_and_mattress, has_washing_machine)
        VALUES (list4_id, false, false, false, true, true, false)
        ON CONFLICT (listing_id) DO NOTHING;

    EXCEPTION WHEN OTHERS THEN
        -- Seed gracefully skips if auth.users foreign key constraint triggers in isolated test envs
        RAISE NOTICE 'Seed notice: %', SQLERRM;
    END;
END $$;
