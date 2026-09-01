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

export const IconChevronUp = (p: P) => (
  <svg {...base(p)}>
    <path d="m18 15-6-6-6 6" />
  </svg>
);

export const IconChevronsUpDown = (p: P) => (
  <svg {...base(p)}>
    <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
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

export const IconEyeOff = (p: P) => (
  <svg {...base(p)}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const IconMail = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <polyline points="3 7 12 13 21 7" />
  </svg>
);

export const IconBell = (p: P) => (
  <svg {...base(p)}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export const IconCreditCard = (p: P) => (
  <svg {...base(p)}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

export const IconUsers = (p: P) => (
  <svg {...base(p)}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const IconSettings = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const IconLogOut = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

export const IconLock = (p: P) => (
  <svg {...base(p)}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const IconGoogle = (p: SVGProps<SVGSVGElement>) => (
  <svg width={18} height={18} viewBox="0 0 24 24" {...p}>
    <path
      fill="#EA4335"
      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
    />
    <path
      fill="#4285F4"
      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
    />
    <path
      fill="#FBBC05"
      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
    />
    <path
      fill="#34A853"
      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
    />
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

export const IconFacebook = (p: P) => (
  <svg {...base(p)}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const IconLinkedIn = (p: P) => (
  <svg {...base(p)}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const IconTwitter = (p: P) => (
  <svg {...base(p)}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export const IconYouTube = (p: P) => (
  <svg {...base(p)}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

export const CHANNEL_ICON = {
  whatsapp: IconWhatsApp,
  messenger: IconMessenger,
  facebook: IconFacebook,
  instagram: IconInstagram,
  web: IconWidget,
  telegram: IconGlobe,
  all: IconGlobe,
} as const;

export const IconPlug = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 22v-5M9 8V2M15 8V2M6 8h12a2 2 0 0 1 2 2v2a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-2a2 2 0 0 1 2-2z" />
  </svg>
);

export const IconBot = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4M8 16h.01M16 16h.01" />
  </svg>
);

export const IconHome = (p: P) => (
  <svg {...base(p)}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const IconComments = (p: P) => (
  <svg {...base(p)}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 10h.01M12 10h.01M16 10h.01" />
  </svg>
);

export const IconZap = (p: P) => (
  <svg {...base(p)}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const NAV_ICON = {
  home: IconHome,
  pulse: IconPulse,
  threads: IconThreads,
  comments: IconComments,
  pipeline: IconPipeline,
  truck: IconTruck,
  box: IconBox,
  megaphone: IconMegaphone,
  brain: IconBrain,
  chart: IconChart,
  plug: IconPlug,
  bot: IconBot,
  zap: IconZap,
} as const;
