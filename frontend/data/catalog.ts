import type { Product } from "./types";

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&auto=format&fit=crop&q=70`;

export const PRODUCTS: Product[] = [
  {
    id: "NK-4001",
    name: "Jamdani Handloom Saree",
    nameBn: "জামদানি হাতে বোনা শাড়ি",
    category: "Apparel",
    blurb: "Half-silk Jamdani woven in Rupganj. Six yards with matching blouse piece.",
    price: 6850,
    compareAt: 7900,
    image: img("1610030469983-98e550d6193c"),
    variants: [
      { sku: "JD-IND", label: "Indigo", color: "Indigo", price: 6850, stock: 12 },
      { sku: "JD-TER", label: "Terracotta", color: "Terracotta", price: 6850, stock: 7 },
      { sku: "JD-IVY", label: "Ivory", color: "Ivory", price: 7250, stock: 0 },
    ],
    tags: ["saree", "jamdani", "handloom", "eid", "wedding"],
    visionIndexed: true,
    visionUpdated: "4h ago",
    soldThisWeek: 34,
  },
  {
    id: "NK-4002",
    name: "Khadi Cotton Kurta",
    nameBn: "খাদি সুতির কুর্তা",
    category: "Apparel",
    blurb: "Breathable handspun khadi with a mandarin collar and coconut buttons.",
    price: 2290,
    compareAt: 2650,
    image: img("1602810318383-e386cc2a3ccf"),
    variants: [
      { sku: "KK-M", label: "M · 38", size: "M", price: 2290, stock: 22 },
      { sku: "KK-L", label: "L · 40", size: "L", price: 2290, stock: 18 },
      { sku: "KK-XL", label: "XL · 42", size: "XL", price: 2390, stock: 9 },
      { sku: "KK-XXL", label: "XXL · 44", size: "XXL", price: 2390, stock: 0 },
    ],
    tags: ["kurta", "khadi", "cotton", "casual"],
    visionIndexed: true,
    visionUpdated: "4h ago",
    soldThisWeek: 61,
  },
  {
    id: "NK-4101",
    name: "Nakshi Kantha Bedspread",
    nameBn: "নকশি কাঁথা বেডস্প্রেড",
    category: "Home",
    blurb: "Hand-embroidered king kantha, 90×108 in. Two pillow covers included.",
    price: 5400,
    image: img("1616627561950-9f746e330187"),
    variants: [
      { sku: "NK-KING", label: "King", size: "King", price: 5400, stock: 6 },
      { sku: "NK-QUEEN", label: "Queen", size: "Queen", price: 4700, stock: 11 },
    ],
    tags: ["kantha", "bedding", "home", "gift"],
    visionIndexed: true,
    visionUpdated: "4h ago",
    soldThisWeek: 19,
  },
  {
    id: "NK-4102",
    name: "Terracotta Cushion Set",
    nameBn: "টেরাকোটা কুশন সেট",
    category: "Home",
    blurb: "Set of four block-printed cotton covers, 18 in. Inserts sold separately.",
    price: 1650,
    compareAt: 1990,
    image: img("1584100936595-c0654b55a2e2"),
    variants: [
      { sku: "TC-SET4", label: "Set of 4", price: 1650, stock: 28 },
      { sku: "TC-SET2", label: "Set of 2", price: 890, stock: 41 },
    ],
    tags: ["cushion", "block print", "home decor"],
    visionIndexed: true,
    visionUpdated: "4h ago",
    soldThisWeek: 47,
  },
  {
    id: "NK-4201",
    name: "Jute & Leather Tote",
    nameBn: "পাট ও চামড়ার টোট",
    category: "Accessories",
    blurb: "Golden-fibre jute body with vegetable-tanned leather handles and base.",
    price: 2980,
    image: img("1591561954557-26941169b49e"),
    variants: [
      { sku: "JT-NAT", label: "Natural", color: "Natural", price: 2980, stock: 15 },
      { sku: "JT-BLK", label: "Black trim", color: "Black", price: 3180, stock: 8 },
    ],
    tags: ["bag", "jute", "leather", "tote"],
    visionIndexed: true,
    visionUpdated: "4h ago",
    soldThisWeek: 26,
  },
  {
    id: "NK-4202",
    name: "Brass Kolshi Vase",
    nameBn: "পিতলের কলসি ফুলদানি",
    category: "Home",
    blurb: "Hand-beaten brass in the classic kolshi silhouette. Lacquer-sealed.",
    price: 3450,
    image: img("1578500494198-246f612d3b3d"),
    variants: [
      { sku: "BV-SM", label: 'Small · 8"', size: "S", price: 3450, stock: 9 },
      { sku: "BV-LG", label: 'Large · 12"', size: "L", price: 4900, stock: 4 },
    ],
    tags: ["brass", "vase", "decor", "gift"],
    visionIndexed: false,
    visionUpdated: "pending",
    soldThisWeek: 8,
  },
];

export const CATEGORIES = ["All", "Apparel", "Home", "Accessories"] as const;

/** Feed-sync history — the observability surface the old system never shipped. */
export const FEED_SYNCS = [
  { at: "Today 14:02", source: "nokshi.com.bd/np/products", found: 218, created: 3, updated: 41, oos: 6, ms: 3140, ok: true },
  { at: "Today 08:02", source: "nokshi.com.bd/np/products", found: 215, created: 0, updated: 12, oos: 2, ms: 2870, ok: true },
  { at: "Yesterday 20:02", source: "nokshi.com.bd/np/products", found: 215, created: 1, updated: 9, oos: 0, ms: 3390, ok: true },
  { at: "Yesterday 14:02", source: "nokshi.com.bd/np/products", found: 0, created: 0, updated: 0, oos: 0, ms: 30000, ok: false, error: "Read timeout after 30s — page 2 never returned. Previous catalog kept." },
  { at: "Yesterday 08:02", source: "nokshi.com.bd/np/products", found: 214, created: 2, updated: 27, oos: 4, ms: 2990, ok: true },
];
