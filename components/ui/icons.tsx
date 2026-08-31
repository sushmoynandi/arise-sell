import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (p: P) => ({
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});

export const IconPulse = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 12h3.5l2-6 3.5 12 2.5-8 1.5 2H21" />
  </svg>
);

export const IconThreads = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 11a7.4 7.4 0 0 1-8 7.3L7 21l1-3.4A7.4 7.4 0 1 1 20 11Z" />
    <path d="M9 10h6M9 13.5h3.5" />
  </svg>
);

export const IconPipeline = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="5" height="7" rx="1.4" />
    <rect x="3" y="14" width="5" height="6" rx="1.4" />
    <rect x="16" y="4" width="5" height="6" rx="1.4" />
    <rect x="16" y="13" width="5" height="7" rx="1.4" />
    <path d="M8 7.5h4.5a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 0 1.5 1.5H16" />
  </svg>
);

export const IconTruck = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h8A1.5 1.5 0 0 1 14 7.5V16H3Z" />
    <path d="M14 10h3.6a2 2 0 0 1 1.7 1l1.7 2.8V16h-7" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </svg>
);

export const IconBox = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3 21 7.6v8.8L12 21l-9-4.6V7.6Z" />
    <path d="m3 7.6 9 4.6 9-4.6M12 12.2V21" />
  </svg>
);

export const IconMegaphone = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 10v4a2 2 0 0 0 2 2h1l2.4 4.2a1 1 0 0 0 1.8-.5V16l7.4 3.2A1 1 0 0 0 20 18.3V5.7a1 1 0 0 0-1.4-.9L11.2 8H6a2 2 0 0 0-2 2Z" />
  </svg>
);

export const IconBrain = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5.2A3.2 3.2 0 0 0 6 6.6 3 3 0 0 0 4.4 12 3.2 3.2 0 0 0 6.6 17 3.2 3.2 0 0 0 12 18.8Z" />
    <path d="M12 5.2A3.2 3.2 0 0 1 18 6.6 3 3 0 0 1 19.6 12 3.2 3.2 0 0 1 17.4 17 3.2 3.2 0 0 1 12 18.8Z" />
    <path d="M12 5.2v13.6" />
  </svg>
);

export const IconChart = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 20V4M4 20h16" />
    <path d="M8 20v-6M12.5 20V9M17 20v-9.5" />
  </svg>
);

export const IconBolt = (p: P) => (
  <svg {...base(p)}>
    <path d="M13.2 2 4.5 13.2h6L10.2 22l9.3-11.6h-6.6Z" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);

export const IconArrow = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconSearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
);

export const IconShield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3 5 6v6c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6Z" />
    <path d="m9 12 2 2 4-4.5" />
  </svg>
);

export const IconEye = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);

export const IconGlobe = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M3.4 12h17.2M12 3.4c2.3 2.4 3.4 5.4 3.4 8.6s-1.1 6.2-3.4 8.6c-2.3-2.4-3.4-5.4-3.4-8.6s1.1-6.2 3.4-8.6Z" />
  </svg>
);

export const IconCode = (p: P) => (
  <svg {...base(p)}>
    <path d="m8.5 8-4.5 4 4.5 4M15.5 8l4.5 4-4.5 4" />
  </svg>
);

export const IconSpark = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9Z" />
    <path d="M18.5 3.5v3M20 5h-3" />
  </svg>
);

export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 7.5V12l3 1.8" />
  </svg>
);

export const IconWarn = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4.2 21 19H3Z" />
    <path d="M12 10v4M12 16.6v.2" />
  </svg>
);

export const IconMenu = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const IconClose = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

/* --- Channel glyphs ------------------------------------------------------ */

export const IconWhatsApp = (p: P) => (
  <svg {...base(p)} strokeWidth={1.5}>
    <path d="M3.6 20.4l1.3-4.5A8.2 8.2 0 1 1 8.4 19Z" />
    <path d="M8.9 9.2c.2 1.6 1.1 3 2.4 3.9 1.3.9 1.9.6 2.3.2l.9-.9 1.7 1.2-.7 1c-.6.7-1.9.9-3.5.1a9.2 9.2 0 0 1-4.3-4.6c-.5-1.3-.2-2.3.4-2.7l1-.6 1 1.8Z" />
  </svg>
);

export const IconMessenger = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.4c-4.9 0-8.6 3.6-8.6 8.2a7.9 7.9 0 0 0 3.2 6.3v3.1l3-1.6a9.6 9.6 0 0 0 2.4.3c4.9 0 8.6-3.6 8.6-8.1S16.9 3.4 12 3.4Z" />
    <path d="m7.4 14 2.9-3 1.9 2 2.7-2.9-2.8 3.1-1.9-2Z" />
  </svg>
);

export const IconInstagram = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="5" />
    <circle cx="12" cy="12" r="3.9" />
    <path d="M16.9 7.1v.1" />
  </svg>
);

export const IconWidget = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="4.5" width="18" height="13" rx="2.2" />
    <path d="M3 8.6h18M7 20h10" />
  </svg>
);

export const CHANNEL_ICON = {
  whatsapp: IconWhatsApp,
  messenger: IconMessenger,
  instagram: IconInstagram,
  web: IconWidget,
  telegram: IconGlobe,
} as const;

export const NAV_ICON = {
  pulse: IconPulse,
  threads: IconThreads,
  pipeline: IconPipeline,
  truck: IconTruck,
  box: IconBox,
  megaphone: IconMegaphone,
  brain: IconBrain,
  chart: IconChart,
} as const;
