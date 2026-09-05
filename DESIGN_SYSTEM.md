# AriseSell — Design System & Guidelines

This document establishes the official design system, typography standards, and UI patterns for the project. **All contributors and developers must adhere to these standards to maintain visual consistency.**

---

## 1. Typography Stack (Enterprise Standard)

We use a modern, high-legibility font stack tailored for a professional B2B commerce SaaS:

| Role | Font Family | Variable / Token | Usage |
| :--- | :--- | :--- | :--- |
| **Display & Headings** | **Plus Jakarta Sans** | `var(--font-display)` / `font-display` | `h1`–`h6`, hero headlines, high-level metrics & KPI figures. |
| **Body & UI Interface** | **Inter** | `var(--font-sans)` / `font-sans` | Body copy, data tables, inputs, labels, cards, buttons. |
| **Bangla Typography** | **Hind Siliguri** | `var(--font-hind)` / `font-bangla` | Automatically inherited via `body` fallback chain. |
| **Monospace / Code** | **JetBrains Mono** | `var(--font-jetbrains)` / `font-mono` | API keys, consignment numbers, order IDs (`NP-...`), prices. |

### Global Font Fallback Rule
In `globals.css`, `body` is configured with:
```css
body {
  font-family: var(--font-sans), var(--font-hind), ui-sans-serif, system-ui, sans-serif;
}
```
> **Rule**: Because `var(--font-hind)` is in the primary fallback chain, any mixed Bangla text (customer messages, product titles, invoice notes) automatically renders with crisp Hind Siliguri typography. You do **not** need to add manual font classes unless explicitly overriding.

---

## 2. Navigation Tabs & Secondary Menus

### The Floating Glassy Pill Pattern
Secondary tab navigation (such as `/console/settings` or sub-modules) must **never** be wrapped in a full-width horizontal navbar strip with full-screen background or borders.

- ❌ **Do NOT**: Add full-width `w-full border-b bg-surface` secondary navbar bars.
- ✅ **DO**: Use a floating frosted glass pill capsule strictly wrapping the tab options:

```tsx
{/* Container: Anchored under the header, margins pass-through */}
<div className="sticky top-[72px] z-20 py-2.5 transition-all pointer-events-none">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
    {/* Frosted Glass Pill Capsule */}
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none p-1.5 rounded-2xl bg-white/80 dark:bg-surface/80 backdrop-blur-xl border border-line/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.03] w-full">
      {/* Tabs list with h-9 px-3 text-[12.5px] 2xl:text-[13px] and motion layoutId */}
    </div>
  </div>
</div>
```

---

## 3. Surface & Color Tokens

- **Canvas (Background)**: `#faf9f7` (`--canvas`, warm paper aesthetic).
- **Surface (Cards & Modals)**: `#ffffff` (`--surface`).
- **Surface 2 (Subtle Fills & Hover)**: `#f4f3f0` (`--surface-2`).
- **Hairline Borders**: `#e7e4de` (`--line`).
- **Primary Accent**: Jade `#0a6e50` (`--signal`), hover `#075940` (`--signal-deep`).
- **Text Hierarchy**:
  - Primary: `#0f1419` (`--text`)
  - Secondary: `#4a5561` (`--text-2`)
  - Tertiary / Muted: `#626b76` (`--text-3`)

---

## 4. UI Best Practices for Contributors

1. **No Emoji Icons**: Always use custom SVG icons from `@/components/ui/icons.tsx`.
2. **Standard Primitives**: Use `Panel`, `Badge`, `Button`, `Meter`, `Input` from `@/components/ui/` rather than raw HTML markup.
3. **Currency Formatting**: Always use `bdt()` or `formatTaka()` from `@/lib/format.ts`.
4. **Verification**: Always run `npm run typecheck` and `npm run lint` before committing code.
