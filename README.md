# 🏡 Bodima (bodima.lk)
> **Hyper-Localized Accommodation, Boarding Room, and Annex Discovery Platform for Sri Lankan University Students & Young Professionals**

---

## 🎯 The Core Problem & Solution

In Sri Lanka, over 120,000 state and private university students (UoM, SLIIT, UoC, USJ, Kelaniya, Peradeniya, NSBM) navigate boarding discoveries through paper flyers stuck on lampposts, telephone poles, and unmoderated Facebook groups.
1. **Zero Geospatial Discovery:** Inability to filter rooms within real walking distance of campus back-gates.
2. **Hidden Fee Exploitation:** Landlords frequently demand sudden arbitrary electricity/water splits or non-refundable key money surprises.
3. **Ghost Listings:** Filled rooms linger for months, wasting student call time and travel expenses.
4. **Trust Deficit:** Lack of landlord verification (NIC/utility proof) and ambiguous curfew/gate-key rules.

**Bodima (`bodima.lk`)** solves this with native PostgreSQL + PostGIS geospatial discovery, transparent upfront cost breakdowns, NIC verification badges, zero-cost OpenStreetMap tiles, and instant 1-tap WhatsApp deep inquiries.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Rationale & Sri Lankan Localization |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) + TypeScript | React Server Components, Server Actions, high-performance SSR/SSG |
| **Styling** | Tailwind CSS + Lucide Icons | Responsive split-view desktop & toggle-view mobile UI |
| **Mapping** | Leaflet.js + OpenStreetMap (CartoDB Positron) | Zero API billing (eliminates Google Maps pay-per-load charges) |
| **Database** | PostgreSQL + PostGIS Extension | Native `geography(POINT, 4326)` spatial types & GIST indexing |
| **Backend** | Supabase Backend as a Service | Database, Auth (Phone SMS/Google), Storage buckets, Row Level Security |
| **Search Engine**| `search_nearby_bodim` RPC Function | In-database spatial execution with `ST_DWithin` & `ST_Distance` |
| **Comms** | WhatsApp Direct Integration | Direct `wa.me/947...` deep links with pre-filled title and listing ID |
| **i18n** | Trilingual UI | English, Sinhala (සිංහල), Tamil (தமிழ்) |

---

## 🏛️ Project Directory Structure

```text
bodima-lk/
├── supabase/
│   └── schema.sql             # Complete PostGIS schema, indexes, RPC function, RLS & seed data
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   └── searchBodim.ts # Next.js Server Action invoking search_nearby_bodim RPC
│   │   ├── layout.tsx         # Root layout with metadata and fonts
│   │   ├── page.tsx           # Discover screen (Split map/list desktop, toggle mobile)
│   │   └── globals.css        # Global CSS + Leaflet popup overrides
│   ├── components/
│   │   ├── listings/
│   │   │   ├── ListingCard.tsx           # Renter card: price, walking time, WhatsApp CTA
│   │   │   └── UtilityBreakdownCard.tsx  # Transparent fee & rules comparison modal
│   │   ├── map/
│   │   │   ├── MapContainer.tsx          # Leaflet map, custom price pins, radius circle
│   │   │   └── UniversityQuickBar.tsx    # Campus proximity selector (UoM, SLIIT, UoC...)
│   │   └── landlord/
│   │       └── ListingWizardModal.tsx    # 3-step listing wizard & instant vacancy toggle
│   ├── lib/
│   │   ├── constants/
│   │   │   └── universities.ts           # Geo-coordinates for top Sri Lankan universities
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Browser Supabase client
│   │   │   └── server.ts                 # Server Supabase client
│   │   └── utils/
│   │       └── formatters.ts             # LKR currency, walk time & WhatsApp URL generator
│   └── types/
│       └── bodima.ts                     # TypeScript data contracts & database models
├── .env.example
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## ⚡ Quick Start & Setup

### 1. Database Setup (Supabase)
1. Create a free project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Paste and run the complete script found at [supabase/schema.sql](file:///c:/Users/MalithRaja/OneDrive/Documents/GitHub/Localized-Affordable-Housing-Boarding-Finder-main/supabase/schema.sql).
4. This script automatically enables `postgis`, creates tables (`profiles`, `listings`, `amenities`, `reviews`), configures GIST spatial indexes, activates RLS policies, defines the `search_nearby_bodim` stored procedure, and inserts seed listings around Moratuwa, Colombo, and Malabe.

### 2. Environment Configuration
Create a `.env.local` file in your project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install & Run
```bash
npm install
npm run dev
```
Open [http://localhost:4000](http://localhost:4000) in your browser.
*(Note: If Supabase keys are not provided yet, Bodima automatically activates its built-in geo-anchored offline preview dataset so the UI and map work instantly!)*
