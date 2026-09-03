import type { SVGProps } from "react";
import type { Tint } from "@/data/marketing";

/** Soft tinted treatments for feature icons — colour is what makes a feature grid read as friendly. */
export const TINTS: Record<Tint, { bg: string; fg: string; ring: string; soft: string }> = {
  jade: { bg: "bg-[#e6f4ee]", fg: "text-[#0a6e50]", ring: "ring-[#bfe3d5]", soft: "bg-[#f2faf6]" },
  azure: { bg: "bg-[#e4f0fb]", fg: "text-[#0a5aa8]", ring: "ring-[#bcd9f2]", soft: "bg-[#f2f8fd]" },
  iris: { bg: "bg-[#ebe8fb]", fg: "text-[#4a3bc4]", ring: "ring-[#cfc7f2]", soft: "bg-[#f6f4fd]" },
  amber: { bg: "bg-[#fbf0dd]", fg: "text-[#8a4700]", ring: "ring-[#efd6ab]", soft: "bg-[#fdf8ee]" },
  rose: { bg: "bg-[#fbe7e5]", fg: "text-[#a82a1f]", ring: "ring-[#f0c4bf]", soft: "bg-[#fdf4f3]" },
  teal: { bg: "bg-[#dff1f0]", fg: "text-[#0a6a68]", ring: "ring-[#b5dedb]", soft: "bg-[#f0f9f8]" },
};

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});

const Chat = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 11.5a7.5 7.5 0 0 1-8.2 7.4L7 21.5l1-3.6A7.5 7.5 0 1 1 20 11.5Z" />
    <path d="M9 10h6M9 13.5h3.5" />
  </svg>
);

const Bangla = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6h9a4 4 0 0 1 0 8H8l4 5" />
    <path d="M4 6v13" />
    <path d="M17.5 5.5v3M19 7h-3" />
  </svg>
);

const Camera = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2l1.2-2h8.2l1.2 2h2.2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5Z" />
    <circle cx="12" cy="12.5" r="3.4" />
  </svg>
);

const Cart = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 4h2.2l2.1 10.4a1.6 1.6 0 0 0 1.6 1.3h7.9a1.6 1.6 0 0 0 1.6-1.2L20 8H6" />
    <circle cx="9.5" cy="19.5" r="1.4" />
    <circle cx="17" cy="19.5" r="1.4" />
  </svg>
);

const Truck = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h8A1.5 1.5 0 0 1 14 7.5V16H3Z" />
    <path d="M14 10h3.6a2 2 0 0 1 1.7 1l1.7 2.8V16h-7" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </svg>
);

const Invoice = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 3h9l4 4v14l-2.5-1.5L14 21l-2.5-1.5L9 21l-2.5-1.5L4 21V5a2 2 0 0 1 2-2Z" />
    <path d="M8 9h7M8 13h7M8 17h4" />
  </svg>
);

const Megaphone = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 10v4a2 2 0 0 0 2 2h1l2.4 4.2a1 1 0 0 0 1.8-.5V16l7.4 3.2A1 1 0 0 0 20 18.3V5.7a1 1 0 0 0-1.4-.9L11.2 8H6a2 2 0 0 0-2 2Z" />
  </svg>
);

const Chart = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 20V4M4 20h16" />
    <path d="M8 20v-5M12.5 20V9.5M17 20v-8" />
  </svg>
);

export const FEATURE_ICON = {
  chat: Chat,
  bangla: Bangla,
  camera: Camera,
  cart: Cart,
  truck: Truck,
  invoice: Invoice,
  megaphone: Megaphone,
  chart: Chart,
} as const;
