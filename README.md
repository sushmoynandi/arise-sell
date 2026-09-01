# NextProduct AI

> **The commerce engine that closes the order.**
> A 24/7 conversational commerce platform for Bangladeshi e-commerce and F-commerce.

NextProduct AI is an automated commerce platform built for modern merchants in Bangladesh. Instead of just answering chats, the agent understands Bangla & Banglish inquiries, matches customer photo screenshots directly to SKU items, captures deliverable addresses, issues Bangla invoices (চালান), and automates courier bookings (Pathao, Steadfast, RedX).

---

## 🚀 Key Highlights & Capabilities

- **Bangla & Banglish AI Agent**: Native understanding of conversational Bangla, transliterated Banglish, voice notes, and regional nuances.
- **Vision SKU Matcher**: Automatically extracts and matches product screenshots sent by customers to real catalog inventory.
- **Automated Fulfilment**: Generates branded Bangla invoices and auto-books couriers (Pathao, Steadfast, RedX, eCourier) with parcel weight & COD calculation.
- **Multi-Stage Sales Pipeline**: Kanban workflow with human-in-the-loop validation for high-risk actions.
- **Full-featured Console**:
  - **Pulse**: Revenue KPIs, real-time event stream, channel mix, and AI spend ceiling.
  - **Threads / Inbox**: Live conversations with message glossing, safety guardrails, and instant human takeover.
  - **Pipeline**: Stage tracking from lead to delivered order.
  - **Fulfilment**: Order processing, live courier tracking, and printable invoice generator.
  - **Catalog**: Live inventory sync, variant management, and computer vision indexing.
  - **Reach**: Promotional campaigns, automated Facebook/Instagram comment-to-DM triggers.
  - **Brain**: AI persona tuning, custom business knowledge base, guardrail rules, and test evaluation harnesses.
  - **Signals**: Conversion analytics, ROAS tracking, and meta CAPI event reporting.
- **Unified Support & Admin Desk**: Integrated AI Support assistant with seamless escalation to human admin staff (`/admin/support`).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI & React**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Type Safety**: [TypeScript 5](https://www.typescriptlang.org/)
- **Design Language**: Light commerce-admin with WCAG AA accessibility compliance

---

## 📁 Project Structure

```
├── app/
│   ├── (marketing)/        # Landing, Platform, Pricing, Story, Docs pages
│   ├── console/            # Merchant console (Pulse, Threads, Pipeline, Brain, etc.)
│   ├── admin/              # Super-admin portal & Support Desk
│   ├── api/                # Mock REST API routes (/api/feed, /api/orders)
│   ├── globals.css         # Design system tokens, styles, and animation utilities
│   └── layout.tsx          # Root layout and font configurations
├── components/
│   ├── marketing/          # Public landing and marketing components
│   ├── console/            # Merchant console dashboard modules
│   ├── ui/                 # Core primitive components and custom SVG icon set
│   └── motion/             # Framer motion transition and animation primitives
├── data/                   # Mock business schemas, catalog, threads, and analytics data
├── lib/                    # Formatting helpers, brand configurations, and utilities
└── public/                 # Static brand assets and demo imagery
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ or later
- npm or pnpm / yarn

### Installation & Setup

1. **Clone repository & install dependencies**:
   ```bash
   npm install
   ```

2. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Verify type safety and linting**:
   ```bash
   npm run typecheck
   npm run lint
   ```

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

---

## 📖 Documentation

For detailed design specifications, route mappings, and API contracts, refer to:
- [`SITE.md`](./SITE.md) — Comprehensive site architecture, design system, and changelog.
- [`Next_Product_SYSTEM_DOCUMENTATION.md`](./Next_Product_SYSTEM_DOCUMENTATION.md) — Detailed technical specifications and implementation guides.
- [`CLAUDE.md`](./CLAUDE.md) / [`AGENT.md`](./AGENT.md) — Development workflow guidelines for AI coding assistants.
