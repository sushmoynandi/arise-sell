export interface ProductVariant {
  sku: string;
  size: string;
  color: string;
  price: number;
  in_stock: boolean;
}

export interface CatalogProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  sale_price: number;
  in_stock: boolean;
  stock_quantity: number;
  variants: ProductVariant[];
  images: string[];
  tags: string[];
}

export interface AlapOrder {
  id: string;
  idempotency_key: string;
  timestamp: string;
  channel: "whatsapp" | "messenger" | "instagram" | "telegram" | "web_widget";
  channel_user_id: string;
  customer: {
    name: string;
    phone: string;
    secondary_phone?: string;
    address: {
      full_address: string;
      district: string;
      area: string;
      delivery_type: "home" | "hub";
    };
  };
  items: {
    product_id: string;
    sku: string;
    title: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
  subtotal: number;
  discount: number;
  delivery_charge: number;
  total_amount: number;
  payment_method: "cod" | "online_bKash" | "online_sslcommerz";
  status: "confirmed" | "dispatched_steadfast" | "dispatched_pathao" | "delivered" | "cancelled";
  courier?: {
    provider: "Steadfast" | "Pathao";
    consignment_id: string;
    tracking_code: string;
    status: string;
  };
  notes?: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  target_segment: string;
  template_name: string;
  audience_count: number;
  sent_count: number;
  delivered_rate: string;
  response_rate: string;
  orders_generated: number;
  status: "Active" | "Completed" | "Draft";
}

export interface MetaCapiEvent {
  id: string;
  eventName: "Lead" | "QualifiedLead" | "Purchase";
  customerPhone: string;
  value: number;
  currency: string;
  status: "Sent" | "Skipped" | "Failed";
  timestamp: string;
}

export const INITIAL_PRODUCTS: CatalogProduct[] = [
  {
    id: "PROD-101",
    title: "Blue Runner Sneaker",
    description: "Premium breathable lightweight running shoes engineered for all-day comfort.",
    category: "Footwear",
    price: 2650,
    sale_price: 2450,
    in_stock: true,
    stock_quantity: 45,
    variants: [
      { sku: "BR-40", size: "40", color: "Blue", price: 2450, in_stock: true },
      { sku: "BR-42", size: "42", color: "Blue", price: 2450, in_stock: true },
      { sku: "BR-44", size: "44", color: "Blue", price: 2450, in_stock: false },
    ],
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80",
    ],
    tags: ["shoes", "sneakers", "sports", "running"],
  },
  {
    id: "PROD-102",
    title: "Black Oxford Leather Shoe",
    description: "Handcrafted 100% genuine full-grain leather formal shoes for business wear.",
    category: "Footwear",
    price: 3800,
    sale_price: 3490,
    in_stock: true,
    stock_quantity: 28,
    variants: [
      { sku: "OX-41", size: "41", color: "Black", price: 3490, in_stock: true },
      { sku: "OX-42", size: "42", color: "Black", price: 3490, in_stock: true },
      { sku: "OX-43", size: "43", color: "Black", price: 3490, in_stock: true },
    ],
    images: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=80",
    ],
    tags: ["formal", "leather", "shoes", "office"],
  },
  {
    id: "PROD-103",
    title: "Minimalist Linen Panjabi",
    description: "Ultra-fine organic linen Panjabi with subtle embroidered neckline detail.",
    category: "Apparel",
    price: 2400,
    sale_price: 2150,
    in_stock: true,
    stock_quantity: 60,
    variants: [
      { sku: "PJ-M", size: "M (40)", color: "Off-White", price: 2150, in_stock: true },
      { sku: "PJ-L", size: "L (42)", color: "Off-White", price: 2150, in_stock: true },
      { sku: "PJ-XL", size: "XL (44)", color: "Off-White", price: 2150, in_stock: true },
    ],
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80",
    ],
    tags: ["panjabi", "ethnic", "eid", "fashion"],
  },
];

export const INITIAL_ORDERS: AlapOrder[] = [
  {
    id: "ALAP-1042",
    idempotency_key: "alap_ord_8f94e19b-7342-4912",
    timestamp: "10 mins ago",
    channel: "whatsapp",
    channel_user_id: "+8801715251562",
    customer: {
      name: "Tanvir Ahmed",
      phone: "01712345678",
      address: {
        full_address: "House 14, Road 7, Block C, Mirpur-2, Dhaka",
        district: "Dhaka",
        area: "Mirpur",
        delivery_type: "home",
      },
    },
    items: [
      {
        product_id: "PROD-101",
        sku: "BR-42",
        title: "Blue Runner Sneaker (Size 42)",
        quantity: 1,
        unit_price: 2450,
        total_price: 2450,
      },
    ],
    subtotal: 2450,
    discount: 0,
    delivery_charge: 80,
    total_amount: 2530,
    payment_method: "cod",
    status: "dispatched_steadfast",
    courier: {
      provider: "Steadfast",
      consignment_id: "SF-892184",
      tracking_code: "SF1294812",
      status: "In Transit (Delivery by Tomorrow)",
    },
    notes: "Please call before delivery.",
  },
  {
    id: "ALAP-1041",
    idempotency_key: "alap_ord_9e88b20a-1192-3841",
    timestamp: "45 mins ago",
    channel: "messenger",
    channel_user_id: "fb_usr_8829104",
    customer: {
      name: "Nusrat Jahan",
      phone: "01819234857",
      address: {
        full_address: "Flat 4A, Green Garden, CDA Avenue, Chattogram",
        district: "Chattogram",
        area: "CDA Avenue",
        delivery_type: "home",
      },
    },
    items: [
      {
        product_id: "PROD-102",
        sku: "OX-42",
        title: "Black Oxford Leather Shoe (Size 42)",
        quantity: 1,
        unit_price: 3490,
        total_price: 3490,
      },
    ],
    subtotal: 3490,
    discount: 100,
    delivery_charge: 130,
    total_amount: 3520,
    payment_method: "cod",
    status: "dispatched_pathao",
    courier: {
      provider: "Pathao",
      consignment_id: "PTH-99214",
      tracking_code: "PT-7718290",
      status: "Assigned Rider",
    },
    notes: "Evening delivery preferred.",
  },
  {
    id: "ALAP-1040",
    idempotency_key: "alap_ord_4f11c77d-9920-1092",
    timestamp: "2 hours ago",
    channel: "instagram",
    channel_user_id: "ig_usr_559281",
    customer: {
      name: "Mahmud Hasan",
      phone: "01911849201",
      address: {
        full_address: "Holding 52, South Central Road, Khulna",
        district: "Khulna",
        area: "Central",
        delivery_type: "hub",
      },
    },
    items: [
      {
        product_id: "PROD-103",
        sku: "PJ-L",
        title: "Minimalist Linen Panjabi (Size L)",
        quantity: 2,
        unit_price: 2150,
        total_price: 4300,
      },
    ],
    subtotal: 4300,
    discount: 200,
    delivery_charge: 130,
    total_amount: 4230,
    payment_method: "online_bKash",
    status: "confirmed",
    notes: "Hub pickup at Khulna Sadar.",
  },
];

export const INITIAL_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: "CAMP-01",
    name: "Weekend Flash Sale 15% OFF",
    target_segment: "Bought in last 30 days (Upsell)",
    template_name: "weekend_flash_v2",
    audience_count: 1450,
    sent_count: 1450,
    delivered_rate: "99.2%",
    response_rate: "34.8%",
    orders_generated: 118,
    status: "Active",
  },
  {
    id: "CAMP-02",
    name: "Cart Recovery & Lead Follow-up",
    target_segment: "Asked but never ordered (Lead recovery)",
    template_name: "abandoned_cart_reminder",
    audience_count: 820,
    sent_count: 820,
    delivered_rate: "98.7%",
    response_rate: "41.5%",
    orders_generated: 84,
    status: "Active",
  },
  {
    id: "CAMP-03",
    name: "VIP Spender Eid Collection Preview",
    target_segment: "Top spenders (VIP offers & loyalty)",
    template_name: "vip_exclusive_preview",
    audience_count: 320,
    sent_count: 320,
    delivered_rate: "100%",
    response_rate: "56.2%",
    orders_generated: 49,
    status: "Completed",
  },
];

export const INITIAL_CAPI_EVENTS: MetaCapiEvent[] = [
  {
    id: "EVT-901",
    eventName: "Purchase",
    customerPhone: "01712345678",
    value: 2530,
    currency: "BDT",
    status: "Sent",
    timestamp: "10 mins ago",
  },
  {
    id: "EVT-900",
    eventName: "QualifiedLead",
    customerPhone: "01819234857",
    value: 3520,
    currency: "BDT",
    status: "Sent",
    timestamp: "45 mins ago",
  },
  {
    id: "EVT-899",
    eventName: "Lead",
    customerPhone: "01911849201",
    value: 0,
    currency: "BDT",
    status: "Sent",
    timestamp: "2 hours ago",
  },
];

