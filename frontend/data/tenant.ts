/** The demo tenant everything in the console is scoped to. */

export const TENANT = {
  name: "Nokshi & Co.",
  nameBn: "নকশী অ্যান্ড কোং",
  kind: "Handloom, home & lifestyle · Dhaka",
  since: "2021",
  plan: "Free",
  ordersUsed: 0,
  ordersQuota: 100,
  pages: 1,
  logoHue: 82,
} as const;

export const TEAM = [
  {
    name: "Farhana Rahman",
    role: "Owner",
    initials: "FR",
    online: true,
    hue: 82,
    platforms: ["facebook", "instagram", "whatsapp"] as const,
  },
  {
    name: "Imran Kabir",
    role: "Ops Lead",
    initials: "IK",
    online: true,
    hue: 200,
    platforms: ["whatsapp", "messenger"] as const,
  },
  {
    name: "Rafi Chowdhury",
    role: "Moderator",
    initials: "RC",
    online: true,
    hue: 26,
    platforms: ["facebook", "instagram"] as const,
  },
  {
    name: "Sadia Noor",
    role: "Moderator",
    initials: "SN",
    online: false,
    hue: 320,
    platforms: ["instagram"] as const,
  },
] as const;

export const CHANNELS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    detail: "Cloud API · +880 1710-XXXX",
    live: true,
    share: 46,
  },
  {
    id: "messenger",
    label: "Messenger",
    detail: "3 pages connected",
    live: true,
    share: 28,
  },
  {
    id: "instagram",
    label: "Instagram",
    detail: "DMs + comments",
    live: true,
    share: 17,
  },
  {
    id: "web",
    label: "Web widget",
    detail: "nokshi.com.bd",
    live: true,
    share: 9,
  },
  {
    id: "telegram",
    label: "Telegram",
    detail: "Not connected",
    live: false,
    share: 0,
  },
] as const;

/** Merchants shown as social proof on the marketing site. */
export const MERCHANTS = [
  "Nokshi & Co.",
  "Taant House",
  "Dhaka Denim",
  "Ilish Kitchen",
  "Bengal Botanica",
  "Rickshaw Press",
  "Chandni Ceramics",
  "Padma Leather",
  "Shitol Home",
  "Kacha Bazaar Co.",
] as const;
