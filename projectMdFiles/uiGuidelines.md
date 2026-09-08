Here's a complete, ready-to-use design prompt for LogiSync Pro. I've translated your white/orange/blue direction into an actual token system and mapped it across all 11 modules, since a "clean but data-dense enterprise dashboard" lives or dies on those details.

---

## LogiSync Pro — Visual Design System Prompt

**Product type:** B2B logistics/fleet management SaaS dashboard
**Audience:** Non-technical Indian MSME owners/managers — prioritize clarity, plain labels, and calm visuals over "techy" flash
**Mode:** Light mode default, sidebar navigation, data-dense but breathable

### 1. Design Direction

Professional enterprise-SaaS feel — closer to Linear/Notion-style calm minimalism than a flashy crypto/AI dashboard. Flat design with *subtle* elevation (soft shadows, no heavy gradients or glassmorphism). Rounded-but-not-bubbly corners. The AI and blockchain features should feel like quiet, trustworthy assistants, not sci-fi flourishes — this audience needs confidence, not spectacle.

### 2. Color System

**Primary — White / Neutral base** (dominant surface, ~70% of UI)
| Token | Hex | Use |
|---|---|---|
| `bg-base` | `#FFFFFF` | Page background, cards |
| `bg-subtle` | `#F8FAFC` | Sidebar bg, section dividers, table stripes |
| `bg-muted` | `#F1F5F9` | Input fields, hover states |
| `border` | `#E2E8F0` | Card borders, table lines |
| `text-primary` | `#0F172A` | Headings, key data |
| `text-secondary` | `#475569` | Body, labels |
| `text-muted` | `#94A3B8` | Placeholders, timestamps |

**Secondary — Orange** (brand/action color, used deliberately — CTAs, active nav state, key highlights, AI touchpoints)
| Token | Hex | Use |
|---|---|---|
| `orange-600` | `#EA580C` | Primary buttons, active nav indicator, links-as-CTA |
| `orange-500` | `#F97316` | Hover states, brand accents, AI sparkle/badge icon |
| `orange-50` | `#FFF7ED` | Tinted badge backgrounds, selected row highlight |

**Tertiary — Blue** (informational/secondary actions — links, map routes, "in transit"/neutral-info states, blockchain "verified" trust color)
| Token | Hex | Use |
|---|---|---|
| `blue-600` | `#2563EB` | Secondary buttons, map routes, chart lines, "In Transit" badges |
| `blue-500` | `#3B82F6` | Info icons, hover on secondary elements |
| `blue-50` | `#EFF6FF` | Info badge backgrounds, blockchain "verified" tint |

**Semantic status (independent of brand orange — use amber, not brand-orange, for "warning" so it never gets confused with the brand accent)**
| State | Color | Hex | Use |
|---|---|---|---|
| Good/Active/On-time | Green | `#16A34A` (bg `#F0FDF4`) | Fleet active, on-time delivery, healthy stock |
| Warning/Attention | Amber | `#D97706` (bg `#FFFBEB`) | Idle vehicle, low stock, minor delay |
| Critical | Red | `#DC2626` (bg `#FEF2F2`) | Breakdown, cold-chain breach, missed SLA, high-risk shipment |
| Neutral/Maintenance | Slate | `#64748B` (bg `#F1F5F9`) | Maintenance mode, paused, no-data |

Rule: never rely on color alone — every status pill pairs a color with an icon and a text label (critical for a non-technical audience).

### 3. Typography

- **Headings:** Manrope or Plus Jakarta Sans (600–700 weight) — geometric, modern, friendly-but-professional
- **Body/UI/Tables:** Inter (400/500) — best-in-class legibility and tabular figures for data-heavy screens
- **Numeric data (KPIs, tables, tx hashes):** Use `tabular-nums`, and for tx hashes specifically, a monospace face (JetBrains Mono or Roboto Mono)
- **Hindi/English mix support:** Pair with Noto Sans Devanagari as fallback so mixed labels render with matched x-height/weight
- **Scale:** 12 / 14 / 16 / 18 / 24 / 32 px — 16px minimum for body, 1.5 line-height
- **Hierarchy:** 700 for headings, 500 for labels/table headers, 400 for body — never rely on size alone for emphasis

### 4. Iconography

Lucide icons only (pairs natively with shadcn/ui) — 1.5–2px stroke, 20–24px in nav/headers, 16–18px inline in tables/badges. No emoji anywhere, including status indicators.

### 5. Layout & Grid

- Spacing rhythm: 4/8px scale throughout (4, 8, 12, 16, 24, 32, 48)
- Radius scale: 8px (buttons, inputs, small cards) / 12px (dashboard cards, panels) / 16px (modals)
- Shadow scale: `sm` for cards on white (`0 1px 2px rgba(15,23,42,0.06)`), `md` for dropdowns/popovers, `lg` for modals only — never decorative shadows
- Max content width: fluid, capped ~1440px, 24–32px page padding
- Breakpoints: 375 / 768 / 1024 / 1440 — desktop-first given the operational-dashboard nature, but sidebar collapses to icon-only ≤1024px and to a bottom/hamburger pattern ≤768px

### 6. App Shell

**Sidebar** (fixed, 260px expanded / 72px icon-only collapsed, `bg-subtle` background, right border):
- Logo top
- Nav grouped by mental model, not flat list:
  - *Overview* — Dashboard
  - *Operations* — Fleet, Live Map, Warehouse, Last-Mile Delivery, Supply Chain
  - *Intelligence* — Route Optimization, Demand Forecasting, Driver Analytics, Blockchain Verification
  - *Admin* — Alert Center, Settings
- Active item: orange-600 left-border indicator + orange-50 background tint + orange-600 icon/text (never color alone — also bolder weight)
- Icons + text labels always, never icon-only

**Topbar:** breadcrumb/page title, global search, alert bell with red count badge, warehouse/company switcher dropdown, user avatar + role pill (Admin/Manager/Staff/Viewer, each a small colored pill using the neutral/tertiary palette, not the semantic status colors)

**Dashboard home:** hero KPI row (4–6 cards: on-time %, active fleet, cost savings, delay-risk shipments) → live map/chart row → recent alerts feed. On-time delivery and cost savings get the most visual weight, per your target-user priorities.

### 7. Module-by-Module Component Notes

- **Fleet Management** — table with truck-icon avatar, status pill (Active=green / Idle=slate / Maintenance=amber), fuel level as thin horizontal bar
- **Live Map** — light/minimal basemap (CartoDB Positron-style, not default OSM blue), truck markers color-coded by status, blue polylines for planned routes, floating white pill for ETA per marker, clustering at zoomed-out levels
- **Warehouse Management** — SKU table/grid, temperature-zone badges (Ambient=slate, Cold=blue, Frozen=deeper blue + snowflake icon), stock-level progress bar shifting green→amber→red, reorder alert as amber/red badge
- **Last-Mile Delivery Tracker** — Kanban columns (Pickup → In Transit → Out for Delivery → Delivered), cards with driver avatar + order ID, delayed orders get a red corner ribbon, not just a red border
- **Supply Chain Visibility** — horizontal stepper (Supplier→Warehouse→Transit→Delivered) with a risk-score chip (green/amber/red) per shipment
- **AI Route Optimization** — left panel: draggable stop list input; right panel: map + result stat cards (distance/time/fuel cost). Use a small orange sparkle icon consistently as the "AI-generated" marker across this and forecasting — one visual language for "AI touched this"
- **Predictive Demand Forecasting** — Recharts line/area per SKU, solid line = historical, dashed = forecast, callout card for recommended reorder qty/date
- **Driver Analytics** — leaderboard list with rank, small sparkline trend per driver, radial gauge for safety score (green/amber/red arc)
- **Blockchain Verification** — vertical stepper of verification stages, blue "verified" check icons (trust color, not orange), tx hash in monospace with copy icon — deliberately understated, not neon-crypto styled
- **Alert Center** — feed list, left-edge color strip per severity, unread = filled dot, grouped by date
- **Settings & Roles** — simple stacked forms, role pills, integration cards (ERP/WhatsApp/e-Way Bill) shown as connect-status cards with a muted "Coming soon" state for placeholders

### 8. Data & Demo Labeling

Small neutral outline "DEMO DATA" badge (slate text/border, not alarming color) placed consistently top-right of data widgets or as a slim top-of-page banner — visible but not anxiety-inducing.

### 9. Motion

Keep it minimal and functional: 150–250ms ease-out for hover/panel transitions, no decorative animation. Chart/map data should be readable immediately, not wait on an entrance animation.

### 10. Accessibility

4.5:1 text contrast minimum (orange-600 on white passes; verify orange-500 only for large text/icons), status never conveyed by color alone, 44px minimum touch targets even on desktop-dense tables, visible focus rings in orange-600.

### Anti-patterns to avoid
Don't use brand-orange for warning states (confuses "action" with "alert"), don't mix filled/outline icon styles, don't let the map/blockchain modules turn dark/neon, don't use icon-only nav items for a non-technical audience.