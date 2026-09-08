Build the foundation for LogiSync Pro, an AI-driven logistics management
platform for Indian MSMEs who currently run logistics through WhatsApp,
Excel, and phone calls. This is Phase 1: project setup, the app shell,
and the Dashboard Overview page only. Other modules (Fleet, Live Map,
Warehouse, Delivery Tracker, Supply Chain, Route AI, Forecasting, Driver
Analytics, Blockchain Verification, Alert Center, Settings) will be built
in later prompts — scaffold the routes/nav for them but leave pages as
simple placeholders for now.

TECH STACK
- Next.js 14, App Router, TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Recharts (charts), react-leaflet (maps) — install now, use in Phase 2+
- lucide-react for all icons (no emoji, ever)
- All data must come from a /lib/mock-data/ folder, clearly typed and
  labeled MOCK_DATA in code, with a visible "DEMO DATA" badge in the UI

DESIGN TOKENS — add to tailwind.config.ts under theme.extend.colors:
  primary:   { DEFAULT: '#FFFFFF', subtle: '#F8FAFC', muted: '#F1F5F9' }
  brand:     { 50: '#FFF7ED', 500: '#F97316', 600: '#EA580C' }   // orange
  info:      { 50: '#EFF6FF', 500: '#3B82F6', 600: '#2563EB' }   // blue
  success:   { 50: '#F0FDF4', 600: '#16A34A' }
  warning:   { 50: '#FFFBEB', 600: '#D97706' }   // amber, NOT brand orange
  critical:  { 50: '#FEF2F2', 600: '#DC2626' }
  neutral:   { 400: '#94A3B8', 600: '#475569', 900: '#0F172A' }
  border:    '#E2E8F0'

Fonts: Manrope (headings, 600/700) + Inter (body/UI/tables, 400/500),
loaded via next/font. Radius scale: 8px inputs/buttons, 12px cards,
16px modals. Shadows: subtle only (sm on cards, md on dropdowns, lg on
modals) — no glassmorphism, no heavy gradients.

FOLDER STRUCTURE
/app
  /(dashboard)
    layout.tsx          -> sidebar + topbar shell
    page.tsx             -> Dashboard Overview
    /fleet/page.tsx       -> placeholder
    /live-map/page.tsx    -> placeholder
    /warehouse/page.tsx   -> placeholder
    /delivery/page.tsx    -> placeholder
    /supply-chain/page.tsx -> placeholder
    /route-ai/page.tsx    -> placeholder
    /forecasting/page.tsx -> placeholder
    /driver-analytics/page.tsx -> placeholder
    /blockchain/page.tsx  -> placeholder
    /alerts/page.tsx      -> placeholder
    /settings/page.tsx    -> placeholder
/components
  /layout   (Sidebar, Topbar, PageHeader)
  /ui       (shadcn primitives)
  /shared   (KpiCard, StatusPill, DemoDataBadge)
/lib/mock-data

BUILD THIS NOW

1. App Shell
   - Sidebar: 260px expanded / 72px icon-only ≤1024px, bg-primary-subtle,
     right border. Logo at top. Nav grouped into four labeled sections:
     Overview (Dashboard) / Operations (Fleet, Live Map, Warehouse,
     Delivery, Supply Chain) / Intelligence (Route AI, Forecasting,
     Driver Analytics, Blockchain) / Admin (Alerts, Settings). Every item
     has an icon + text label. Active route: brand-600 left border +
     brand-50 background + brand-600 icon/text + medium font weight.
   - Topbar: page title, global search input, alert bell icon with a
     critical-600 count badge, warehouse/company switcher dropdown,
     user avatar + role pill (Admin/Manager/Staff/Viewer).
   - Both must collapse gracefully at 1024px and 768px breakpoints —
     no horizontal scroll at any width.

2. Dashboard Overview page
   - Hero row of 5 KPI cards, mock data, largest visual weight on
     "On-Time Delivery %" and "Cost Savings This Month" (this audience's
     top priorities): On-Time %, Active Vehicles, Cost Savings (₹),
     Open Delay-Risk Shipments, Low-Stock SKUs. Each card: label, big
     number, small trend indicator (up/down %), colored left accent
     using success/warning/critical tokens — never color alone, pair
     with an up/down icon.
   - Below: a two-column row — left: placeholder card for the live map
     ("Fleet map coming in Phase 2"), right: a Recharts line chart of
     mock weekly delivery volume (info-600 line, subtle grid, tabular
     axis labels).
   - Below that: a Recent Alerts feed — 5 mock alert rows, left color
     strip per severity (critical/warning/info), icon + short message
     + relative timestamp.
   - Visible "DEMO DATA" badge (neutral outline pill, not alarming
     color) top-right of the dashboard header.

3. Shared components to build now (reused everywhere later)
   - KpiCard, StatusPill (Active=success / Idle=neutral / Maintenance=
     warning / Critical=critical — icon + text always, not color alone),
     DemoDataBadge, PageHeader (title + breadcrumb + actions slot).

CONSTRAINTS
- Light mode only for now. TypeScript strict — no `any`. Every mock data
  file typed with an explicit interface. Mobile-first responsive, but
  this is primarily a desktop operational tool — tablet/desktop is the
  priority breakpoint, not phone.
- Keep this prompt's scope to shell + dashboard only. Do not build out
  the Fleet, Live Map, or other module pages beyond a simple "Coming
  soon" placeholder with the right page title and breadcrumb.