# NextProduct AI (আলাপ AI Engine Architecture)

> Enterprise-Grade Omnichannel Conversational AI Sales & Logistics Engine for Bangladeshi E-Commerce & F-Commerce.

---

## 1. Core Platform Specifications Implemented

### A. Omnichannel Messaging Gateway
- **Official Meta WhatsApp Cloud API**: Real-time sales automation, template message triggers, 0% ban risk.
- **Facebook Messenger & Instagram Direct**: Post comment automation (public reply + auto-DM catalog links) and direct chat resolution.
- **Web Chat Widget**: Integrated with phone number KYC verification and live checkout.

### B. Specialized Bangla / Banglish NLP & Multimodal Vision
- Interprets colloquial Bangla script, phonetic Banglish (*"vai ei blue runner size 42 available ache? price koto?"*), and standard English.
- **Multimodal Vision Engine**: Matches uploaded product screenshots with catalog SKU embeddings and pulls unedited warehouse photos.

### C. Logistics Handshake (Steadfast & Pathao Courier)
- **Steadfast Courier API**: Auto-creates parcels with 11-digit phone validation, address parsing, and COD assignment.
- **Pathao Courier API**: Dynamic multi-store pickup location mapping and live rider tracking.

### D. API Reference Endpoints
- **Product Feed API (`GET /api/feed`)**: Conforms to standard Alap AI JSON catalog feed specification.
- **Website Order API (`POST /api/orders`)**: Dispatches confirmed orders with `Idempotency-Key` deduplication.

### E. Meta Conversions API (CAPI)
- Server-side event pipeline for `Lead`, `QualifiedLead`, and `Purchase` to bypass browser signal loss.
- Pre-flight test code validator (`TESTXXXX`) with event logs.

### F. Automated Bangla PDF Invoicing
- Itemized billing breakdown with delivery charges, discounts, terms in Bangla/English, and courier tracking details.

---

## 2. Pages & Routes
- **Landing Page (`/`)**: Alap-themed high-converting page with interactive simulation, trusted merchant marquee, capability grid, 4-step setup, client reviews, and ৳0 / ৳299 / ৳999 pricing tiers.
- **Operations Hub (`/dashboard`)**: Full 8-tab operations hub (Overview, Live Omnichannel Inbox, Orders & Invoicing, Catalog Feed, WhatsApp Broadcasts, Courier Dispatch, Meta CAPI Attribution, and Agent Persona/Schema settings).
- **Product Feed Endpoint (`/api/feed`)**: Live authenticated JSON feed endpoint.
- **Order Webhook Endpoint (`/api/orders`)**: Live order processing and Steadfast consignment generation endpoint.

## Sections (in order)
1. **Navbar** — Logo, nav links, "Join Waitlist" button. Sticky with blur backdrop. Mobile hamburger.
2. **Hero** — Centered layout: bold headline with "#1" underline accent, subtitle, live countdown timer, email capture with social proof avatars. Below: a full product dashboard mockup (browser frame with waitlist stats, growth chart, position tracker, recent signups sidebar). Floating cards around the mockup show live metrics. Dot grid background. Auto-switches to PH voting banner on launch day.
3. **Stats Bar** — 4 key metrics with colored icons on soft gray background.
4. **Features** — 8 feature cards with colorful icon badges (each card a different color accent). 4-column grid.
5. **Referral Waitlist** — Left: phone mockup illustration showing #47 position and viral connections. Right: 3-step explanation of viral referral loop.
6. **How It Works** — 4 steps with colorful SVG illustrations (calendar, customizer, network graph, trophy).
7. **Video Demo** — Browser window illustration with play button overlay. Placeholder for Loom/YouTube embed.
8. **Founder Story** — Left: founder at laptop illustration. Right: personal narrative + founder card with social links.
9. **Testimonials** — 4 review cards with star ratings, quotes, colored avatar badges.
10. **Press Kit** — Left: 4 asset cards + download button. Right: folder/documents illustration.
11. **Final CTA** — Indigo rounded card with geometric background shapes, email capture.
12. **Footer** — Dark navy background with social icons, product links, resources.

## Illustrations & Graphics
- `components/ui/Illustrations.tsx` — All SVG illustrations:
  - **RocketIllustration** — Hero section rocket with stars, clouds, speed lines
  - **WaitlistIllustration** — Phone mockup with position tracker and connected people avatars
  - **CountdownIllustration** — Clock face with countdown number boxes
  - **FounderIllustration** — Person at laptop with floating idea icons
  - **PressKitIllustration** — Folder with documents, image previews, download button
  - **DemoIllustration** — Browser window showing product UI mockup
  - **StepIllustration** — 4 unique illustrations (calendar, customizer, growth chart, trophy)

## Components
- `components/layout/Navbar.tsx` — Sticky navigation with blur backdrop
- `components/layout/Footer.tsx` — Dark footer with social icons
- `components/sections/Hero.tsx` — Hero with countdown + email form + rocket illustration
- `components/sections/StatsSection.tsx` — Metrics with icons
- `components/sections/FeaturesSection.tsx` — Color-coded feature cards
- `components/sections/WaitlistPosition.tsx` — Referral waitlist with illustration
- `components/sections/HowItWorks.tsx` — 4-step process with illustrations
- `components/sections/VideoDemoSection.tsx` — Demo embed with browser illustration
- `components/sections/FounderStory.tsx` — Story with illustration + social links
- `components/sections/ReviewsSection.tsx` — Star-rated testimonial cards
- `components/sections/PressKitSection.tsx` — Press kit cards with illustration
- `components/sections/CTASection.tsx` — Indigo CTA with geometric shapes
- `components/ui/Illustrations.tsx` — All SVG illustrations

## Data Files
- `data/features.ts` — 8 features
- `data/reviews.ts` — 4 testimonials
- `data/stats.ts` — 4 metrics
- `data/howItWorks.ts` — 4 steps
- `lib/constants.ts` — Product name, tagline, launch date, links

## How to Customize
- **Change launch date:** Edit `lib/constants.ts` → `LAUNCH_DATE`
- **Change product name/tagline:** Edit `lib/constants.ts`
- **Change colors:** Edit CSS variables in `app/globals.css`
- **Update features:** Edit `data/features.ts`
- **Update testimonials:** Edit `data/reviews.ts`
- **Update stats:** Edit `data/stats.ts`
- **Add founder photo:** Replace the illustration in `components/sections/FounderStory.tsx` with an `<Image>` tag
- **Add product demo video:** Replace the illustration in `components/sections/VideoDemoSection.tsx` with an iframe embed
- **Swap illustrations:** Edit `components/ui/Illustrations.tsx` or replace with actual images

## Recent Changes
- Added 24/7 Autonomous AI Business Support & Operations Agent (`InteractiveAgentDemo.tsx`) with real-time customer query handling, calendar booking, order tracking, and human-in-the-loop escalation workflows.
- Initial build: Complete HuntReady landing page
- Redesign: Pure white theme, Outfit + Plus Jakarta Sans fonts, colorful SVG illustrations throughout, alternating white/gray sections, indigo + orange accent colors
- Hero redesign: Replaced left/right split with centered layout. Added full product dashboard mockup (browser frame, stats, growth chart, position tracker, recent signups). Floating metric cards around mockup. Dot grid background. Social proof avatars below email form. Countdown timer prominently centered above CTA.
- Added Features page (`/features`): Bento grid layout, alternating image showcases, comparison banner
- Added Pricing page (`/pricing`): 3-tier pricing with toggle, FAQ accordion, social proof strip
- Added About page (`/about`): Editorial hero, photo collage, timeline, team cards, values section
- Added Showcase page (`/showcase`): Case studies with stats, masonry testimonials, results cards
- Updated Navbar: Links now point to new pages (Features, Pricing, Showcase, About)
