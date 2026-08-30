"use client";

import { useState } from "react";
import Link from "next/link";
import {
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_CAMPAIGNS,
  INITIAL_CAPI_EVENTS,
  AlapOrder,
  CatalogProduct,
  MarketingCampaign,
  MetaCapiEvent,
} from "@/lib/alap-constants";

interface LiveMessage {
  sender: "user" | "agent" | "system";
  text: string;
  time: string;
  actionPayload?: {
    type: "order_created" | "vision_match" | "courier_dispatch";
    title: string;
    details: string;
  };
}

interface ConversationItem {
  id: string;
  customer: string;
  phone: string;
  channel: "WhatsApp" | "Messenger" | "Instagram" | "Web Chat";
  lastMessage: string;
  time: string;
  status: "Automated" | "Escalated" | "Order Created";
  unread: boolean;
  messages: LiveMessage[];
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "inbox" | "orders" | "catalog" | "campaigns" | "courier" | "capi" | "settings"
  >("overview");

  // Orders State
  const [orders, setOrders] = useState<AlapOrder[]>(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<AlapOrder | null>(INITIAL_ORDERS[0]);
  const [filterCourier, setFilterCourier] = useState<string>("all");

  // Products State
  const [products, setProducts] = useState<CatalogProduct[]>(INITIAL_PRODUCTS);
  const [newProdTitle, setNewProdTitle] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Footwear");

  // Campaigns State
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(INITIAL_CAMPAIGNS);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignSegment, setNewCampaignSegment] = useState("Bought in last 30 days (Upsell)");

  // Meta CAPI State
  const [capiEvents, setCapiEvents] = useState<MetaCapiEvent[]>(INITIAL_CAPI_EVENTS);
  const [testEventCode, setTestEventCode] = useState("TEST8942");
  const [capiTestStatus, setCapiTestStatus] = useState<string | null>(null);

  // Conversations State
  const [conversations, setConversations] = useState<ConversationItem[]>([
    {
      id: "conv-101",
      customer: "Tanvir Ahmed",
      phone: "01712345678",
      channel: "WhatsApp",
      lastMessage: "Ami Blue Runner size 42 ta nite chai. Cash on delivery te hobe?",
      time: "2 mins ago",
      status: "Order Created",
      unread: true,
      messages: [
        { sender: "user", text: "Assalamu Alaikum! Blue Runner Sneaker 42 size ache?", time: "10:14 AM" },
        { sender: "agent", text: "Walaikum Assalam! Ji, Blue Runner Sneaker (Size 42) stock-e ache. Dam 2,450 taka (Regular 2,650 taka). Apni ki order confirm korte chan?", time: "10:14 AM" },
        { sender: "user", text: "Ami Blue Runner size 42 ta nite chai. Cash on delivery te hobe?", time: "10:15 AM" },
        {
          sender: "agent",
          text: "Ji obosshoy! Cash on delivery te nite parben. Order confirm korte apnar Name, 11-digit Phone number ebong Full Address din.",
          time: "10:15 AM",
        },
        { sender: "user", text: "Tanvir Ahmed, 01712345678, House 14, Road 7, Block C, Mirpur-2, Dhaka.", time: "10:16 AM" },
        {
          sender: "agent",
          text: "Dhonnobad! Apnar order confirm kora hoyeche. Steadfast Courier tracking code: SF1294812. 24-48 ghontar moddhe parcel delivery paben.",
          time: "10:16 AM",
          actionPayload: {
            type: "order_created",
            title: "Order #ALAP-1042 Committed",
            details: "COD Amount: ৳2,530 • Steadfast ID: SF-892184",
          },
        },
      ],
    },
    {
      id: "conv-102",
      customer: "Nusrat Jahan",
      phone: "01819234857",
      channel: "Messenger",
      lastMessage: "Chittagong e delivery charge koto?",
      time: "20 mins ago",
      status: "Automated",
      unread: false,
      messages: [
        { sender: "user", text: "Chittagong e delivery charge koto?", time: "09:40 AM" },
        { sender: "agent", text: "Dhaka city-r baire (Chittagong shoho) delivery charge matro 130 taka. Dhaka city-r bhetore 80 taka.", time: "09:40 AM" },
      ],
    },
    {
      id: "conv-103",
      customer: "Mahmud Hasan",
      phone: "01911849201",
      channel: "Instagram",
      lastMessage: "[Sent Image] Ei panjabi ta ki stock ache?",
      time: "1 hour ago",
      status: "Order Created",
      unread: false,
      messages: [
        { sender: "user", text: "[Uploaded Product Screenshot] Ei panjabi ta ki stock ache?", time: "08:15 AM" },
        {
          sender: "agent",
          text: "Vision AI Catalog Match: 'Minimalist Linen Panjabi' (SKU: PROD-103). Off-White color-e M, L, XL size available. Dam 2,150 taka.",
          time: "08:15 AM",
          actionPayload: {
            type: "vision_match",
            title: "Multimodal Vision Match (98.4% Confidence)",
            details: "Matched SKU: PROD-103 Minimalist Linen Panjabi",
          },
        },
      ],
    },
  ]);

  const [selectedConvId, setSelectedConvId] = useState<string>("conv-101");
  const [chatReply, setChatReply] = useState("");

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const handleSendChatReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatReply.trim()) return;

    const newMsg: LiveMessage = {
      sender: "agent",
      text: chatReply,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConvId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: chatReply }
          : c
      )
    );
    setChatReply("");
  };

  const handleCourierBooking = (orderId: string, courierName: "Steadfast" | "Pathao") => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const track = courierName === "Steadfast" ? `SF${Math.floor(1000000 + Math.random() * 9000000)}` : `PT-${Math.floor(1000000 + Math.random() * 9000000)}`;
          return {
            ...ord,
            status: courierName === "Steadfast" ? "dispatched_steadfast" : "dispatched_pathao",
            courier: {
              provider: courierName,
              consignment_id: `${courierName.substring(0, 2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
              tracking_code: track,
              status: "Dispatched (Rider Assigned)",
            },
          };
        }
        return ord;
      })
    );
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdTitle.trim() || !newProdPrice) return;
    const priceNum = parseFloat(newProdPrice);
    const newProd: CatalogProduct = {
      id: `PROD-${100 + products.length + 1}`,
      title: newProdTitle,
      description: "Synchronized item from merchant inventory feed.",
      category: newProdCategory,
      price: priceNum,
      sale_price: priceNum,
      in_stock: true,
      stock_quantity: 50,
      variants: [
        { sku: `SKU-${Date.now().toString().slice(-4)}`, size: "Standard", color: "Default", price: priceNum, in_stock: true }
      ],
      images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"],
      tags: ["store", "feed"],
    };
    setProducts([newProd, ...products]);
    setNewProdTitle("");
    setNewProdPrice("");
  };

  const handleLaunchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;
    const newCamp: MarketingCampaign = {
      id: `CAMP-0${campaigns.length + 1}`,
      name: newCampaignName,
      target_segment: newCampaignSegment,
      template_name: `broadcast_${Date.now().toString().slice(-4)}`,
      audience_count: 500,
      sent_count: 500,
      delivered_rate: "99.8%",
      response_rate: "38.2%",
      orders_generated: 42,
      status: "Active",
    };
    setCampaigns([newCamp, ...campaigns]);
    setNewCampaignName("");
  };

  const handleTestMetaCapi = () => {
    setCapiTestStatus("Sending server-side test payload to Meta Events Manager...");
    setTimeout(() => {
      const newEvt: MetaCapiEvent = {
        id: `EVT-${Date.now().toString().slice(-3)}`,
        eventName: "Purchase",
        customerPhone: "01719998877",
        value: 2450,
        currency: "BDT",
        status: "Sent",
        timestamp: "Just now",
      };
      setCapiEvents([newEvt, ...capiEvents]);
      setCapiTestStatus(`✓ Success: Event matched and validated by Meta CAPI (Test Code: ${testEventCode})`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-black text-white text-base shadow">
                ⚡
              </div>
              <span className="font-bold text-lg text-white">NextProduct AI</span>
            </Link>
            <span className="hidden sm:inline-block text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-medium border border-slate-700">
              🇧🇩 Bangladesh E-Commerce & F-Commerce Edition
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-300 font-medium">Meta CAPI Active</span>
            </div>
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 transition-colors font-medium"
            >
              ← Back to Site
            </Link>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 space-y-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
              Operations Hub
            </p>
            {[
              { id: "overview", label: "Overview & Telemetry", icon: "📊" },
              { id: "inbox", label: "Live Omnichannel Inbox", icon: "💬", badge: "3 Active" },
              { id: "orders", label: "Orders & Invoices", icon: "📦", badge: `${orders.length}` },
              { id: "catalog", label: "Catalog & Feed API", icon: "🛍️" },
              { id: "campaigns", label: "WhatsApp Broadcasts", icon: "📢" },
              { id: "courier", label: "Steadfast & Pathao", icon: "🚚" },
              { id: "capi", label: "Meta CAPI Attribution", icon: "🎯" },
              { id: "settings", label: "AI Persona & Schema", icon: "⚙️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as unknown as typeof activeTab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-sky-500 text-white shadow-sm"
                    : "text-slate-700 hover:bg-[#f0f4f8]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span>{tab.icon}</span>
                  {tab.label}
                </span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      activeTab === tab.id
                        ? "bg-white text-sky-600"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Quick API Endpoints Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-xs space-y-2">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>🔌</span> Live API Endpoints
            </p>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Product Feed (JSON)</span>
              <p className="font-mono text-[10px] text-slate-800 truncate">/api/feed</p>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Order Webhook (POST)</span>
              <p className="font-mono text-[10px] text-slate-800 truncate">/api/orders</p>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "Monthly Conversations", val: "742 / 900", sub: "82.4% consumed", color: "bg-amber-50 border-amber-200" },
                  { title: "Total COD Booked", val: "৳ 1,48,200", sub: "+24% this week", color: "bg-emerald-50 border-emerald-200" },
                  { title: "Steadfast/Pathao Dispatched", val: "94.6%", sub: "Automated 1-click", color: "bg-blue-50 border-blue-200" },
                  { title: "Meta CAPI Purchases", val: "186 Events", sub: "0% Signal Loss", color: "bg-purple-50 border-purple-200" },
                ].map((st, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${st.color} bg-white shadow-sm`}>
                    <p className="text-xs font-semibold text-slate-500">{st.title}</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{st.val}</p>
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">{st.sub}</p>
                  </div>
                ))}
              </div>

              {/* Live Status and Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders Overview */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">Recent Automated Orders</h3>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-xs text-amber-600 font-bold hover:underline"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((ord) => (
                      <div key={ord.id} className="p-3 rounded-xl bg-[#eceef5]/60 border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{ord.id} • {ord.customer.name}</p>
                          <p className="text-slate-500 text-[11px]">{ord.customer.phone} • {ord.customer.address.district}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900">৳ {ord.total_amount}</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            {ord.courier?.provider || "Pending"} ({ord.courier?.tracking_code || "No code"})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Multimodal AI Performance */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-slate-900">Alap AI Engine Health</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-semibold text-slate-700">Bangla & Banglish NLP Accuracy</span>
                      <span className="font-black text-emerald-600">99.1%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-semibold text-slate-700">Multimodal Vision SKU Matching</span>
                      <span className="font-black text-emerald-600">98.4%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-semibold text-slate-700">Phone Number Regex KYC Validation</span>
                      <span className="font-black text-emerald-600">100% Verified</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-semibold text-slate-700">WhatsApp Meta Cloud API Ban Risk</span>
                      <span className="font-black text-emerald-600">0.0% (Official API)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INBOX */}
          {activeTab === "inbox" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[640px]">
              {/* Thread list */}
              <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto">
                <div className="p-3 border-b border-slate-200 bg-slate-50">
                  <p className="text-xs font-bold text-slate-800">Active Conversations</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {conversations.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedConvId(c.id)}
                      className={`w-full text-left p-3.5 transition-colors block ${
                        selectedConvId === c.id ? "bg-sky-50/70 border-l-4 border-sky-500" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          {c.customer}
                        </span>
                        <span className="text-[10px] text-slate-400">{c.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate mb-1.5">{c.lastMessage}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                          {c.channel}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          {c.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat messages */}
              <div className="md:col-span-7 flex flex-col h-full bg-[#f0f4f8]/40">
                <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{activeConv.customer} ({activeConv.phone})</h4>
                    <p className="text-[10px] text-slate-500">Channel: {activeConv.channel} • 24/7 Autopilot Mode</p>
                  </div>
                  <span className="text-[11px] bg-sky-500 text-white font-bold px-2.5 py-1 rounded-full shadow-sm">
                    AI Active
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {activeConv.messages.map((m, idx) => (
                    <div key={idx} className={`flex flex-col ${m.sender === "user" ? "items-start" : "items-end"}`}>
                      <div
                        className={`max-w-[85%] text-xs p-3 rounded-2xl ${
                          m.sender === "user"
                            ? "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                            : "bg-slate-950 text-white rounded-br-none"
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                        {m.actionPayload && (
                          <div className="mt-2 p-2.5 bg-sky-500/20 border border-sky-400 rounded-xl text-slate-100 text-[11px]">
                            <p className="font-bold text-sky-400">✓ {m.actionPayload.title}</p>
                            <p className="text-slate-300">{m.actionPayload.details}</p>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChatReply} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    value={chatReply}
                    onChange={(e) => setChatReply(e.target.value)}
                    placeholder="Step in with human moderator message..."
                    className="flex-1 text-xs bg-slate-100 text-slate-900 px-3.5 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="submit"
                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS & INVOICES */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Alap AI In-Chat Orders ({orders.length})</h3>
                    <p className="text-xs text-slate-500">Autonomous checkout, address KYC validation &amp; courier dispatch.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={filterCourier}
                      onChange={(e) => setFilterCourier(e.target.value)}
                      className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 font-medium"
                    >
                      <option value="all">All Orders</option>
                      <option value="Steadfast">Steadfast Dispatched</option>
                      <option value="Pathao">Pathao Dispatched</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                        <th className="py-2.5 px-3">Order ID</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Phone &amp; Location</th>
                        <th className="py-2.5 px-3">Items</th>
                        <th className="py-2.5 px-3">Total (COD)</th>
                        <th className="py-2.5 px-3">Courier Status</th>
                        <th className="py-2.5 px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders
                        .filter((o) => filterCourier === "all" || o.courier?.provider === filterCourier)
                        .map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-3 font-bold text-slate-900">{ord.id}</td>
                            <td className="py-3 px-3 font-medium">{ord.customer.name}</td>
                            <td className="py-3 px-3 text-slate-600">
                              <p className="font-bold text-slate-800">{ord.customer.phone}</p>
                              <p className="text-[11px] text-slate-500 truncate max-w-[160px]">{ord.customer.address.full_address}</p>
                            </td>
                            <td className="py-3 px-3 text-slate-700">
                              {ord.items.map((it, idx) => (
                                <span key={idx} className="block text-[11px]">{it.title} × {it.quantity}</span>
                              ))}
                            </td>
                            <td className="py-3 px-3 font-black text-slate-900">৳ {ord.total_amount}</td>
                            <td className="py-3 px-3">
                              {ord.courier ? (
                                <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {ord.courier.provider}: {ord.courier.tracking_code}
                                </span>
                              ) : (
                                <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Pending Dispatch
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 space-x-1.5">
                              <button
                                onClick={() => setSelectedOrder(ord)}
                                className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg cursor-pointer"
                              >
                                Invoice PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Branded Bangla PDF Invoice Viewer */}
              {selectedOrder && (
                <div className="bg-white rounded-2xl border-2 border-slate-900 p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-sky-500 flex items-center justify-center font-bold text-white text-xs">
                          ⚡
                        </div>
                        <h4 className="font-bold text-base text-slate-900">চালান / ইনভয়েস (INVOICE #{selectedOrder.id})</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Alap AI Automated E-Commerce Invoicing Engine</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-bold text-slate-900">তারিখ: {selectedOrder.timestamp}</p>
                      <p className="text-emerald-700 font-bold">পেমেন্ট মেথড: Cash on Delivery (COD)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <p className="font-bold text-slate-900">গ্রাহকের বিবরণ (Customer Details):</p>
                      <p className="text-slate-700 font-medium">{selectedOrder.customer.name}</p>
                      <p className="text-slate-700">মোবাইল: {selectedOrder.customer.phone}</p>
                      <p className="text-slate-600">ঠিকানা: {selectedOrder.customer.address.full_address}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <p className="font-bold text-slate-900">কুরিয়ার ট্র্যাকিং (Logistics Handshake):</p>
                      <p className="text-slate-700">কুরিয়ার: <span className="font-bold">{selectedOrder.courier?.provider || "Steadfast Courier"}</span></p>
                      <p className="text-slate-700">ট্র্যাকিং কোড: <span className="font-mono font-bold text-sky-700">{selectedOrder.courier?.tracking_code || "SF-GENERATING"}</span></p>
                      <p className="text-slate-600">ডেলিভারি ধরন: {selectedOrder.customer.address.delivery_type === "home" ? "হোম ডেলিভারি" : "হাব পিকআপ"}</p>
                    </div>
                  </div>

                  <table className="w-full text-xs text-left border-collapse border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 border border-slate-200">পণ্যের বিবরণ (Item)</th>
                        <th className="p-2 border border-slate-200 text-center">পরিমাণ (Qty)</th>
                        <th className="p-2 border border-slate-200 text-right">একক মূল্য (Unit)</th>
                        <th className="p-2 border border-slate-200 text-right">মোট (Total)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((it, i) => (
                        <tr key={i}>
                          <td className="p-2 border border-slate-200 font-medium">{it.title}</td>
                          <td className="p-2 border border-slate-200 text-center">{it.quantity}</td>
                          <td className="p-2 border border-slate-200 text-right">৳ {it.unit_price}</td>
                          <td className="p-2 border border-slate-200 text-right font-bold">৳ {it.total_price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-end text-xs">
                    <div className="w-64 space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex justify-between text-slate-600"><span>সাবটোটাল:</span><span>৳ {selectedOrder.subtotal}</span></div>
                      <div className="flex justify-between text-slate-600"><span>ডেলিভারি চার্জ:</span><span>৳ {selectedOrder.delivery_charge}</span></div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-emerald-600"><span>ডিসকাউন্ট:</span><span>- ৳ {selectedOrder.discount}</span></div>
                      )}
                      <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-200">
                        <span>সর্বমোট বকেয়া (COD):</span><span>৳ {selectedOrder.total_amount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CATALOG & FEED API */}
          {activeTab === "catalog" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Synchronized Product Catalog ({products.length})</h3>
                    <p className="text-xs text-slate-500">Auto-synced from merchant JSON feed endpoint every 6 hours.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/api/feed"
                      target="_blank"
                      className="text-xs bg-sky-500 hover:bg-sky-600 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm"
                    >
                      View Live JSON Feed ↗
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {products.map((p) => (
                    <div key={p.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-slate-500">{p.id}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          {p.in_stock ? `Stock: ${p.stock_quantity}` : "Out of Stock"}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
                      <p className="text-slate-600 line-clamp-2">{p.description}</p>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-base font-black text-slate-950">৳ {p.sale_price}</span>
                        {p.price > p.sale_price && (
                          <span className="text-xs text-slate-400 line-through">৳ {p.price}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Product Manual Override */}
                <form onSubmit={handleCreateProduct} className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="Product Title"
                    value={newProdTitle}
                    onChange={(e) => setNewProdTitle(e.target.value)}
                    className="text-xs bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 flex-1 min-w-[180px]"
                  />
                  <input
                    type="number"
                    placeholder="Price (BDT)"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="text-xs bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 w-32"
                  />
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="text-xs bg-slate-100 px-3 py-2 rounded-lg border border-slate-200"
                  >
                    <option value="Footwear">Footwear</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                  >
                    + Add to Feed
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: WHATSAPP BROADCAST CAMPAIGNS */}
          {activeTab === "campaigns" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">WhatsApp Marketing Broadcasts</h3>
                    <p className="text-xs text-slate-500">Segmented re-engagement &amp; flash sales with instant AI order handoff.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {campaigns.map((camp) => (
                    <div key={camp.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{camp.name}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            {camp.status}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1">Target: <span className="font-bold">{camp.target_segment}</span></p>
                      </div>

                      <div className="flex items-center gap-6 text-center">
                        <div>
                          <p className="font-black text-slate-900 text-sm">{camp.sent_count}</p>
                          <p className="text-[10px] text-slate-500">Sent</p>
                        </div>
                        <div>
                          <p className="font-black text-emerald-600 text-sm">{camp.response_rate}</p>
                          <p className="text-[10px] text-slate-500">Replied</p>
                        </div>
                        <div>
                          <p className="font-black text-amber-600 text-sm">{camp.orders_generated}</p>
                          <p className="text-[10px] text-slate-500">Orders</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Create Campaign */}
                <form onSubmit={handleLaunchCampaign} className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="Campaign Name (e.g. Payday 10% Discount)"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    className="text-xs bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 flex-1 min-w-[200px]"
                  />
                  <select
                    value={newCampaignSegment}
                    onChange={(e) => setNewCampaignSegment(e.target.value)}
                    className="text-xs bg-slate-100 px-3 py-2 rounded-lg border border-slate-200"
                  >
                    <option value="Bought in last 30 days (Upsell)">Bought in last 30 days</option>
                    <option value="Asked but never ordered (Lead recovery)">Asked but never ordered</option>
                    <option value="Top spenders (VIP offers & loyalty)">Top spenders (VIP)</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm"
                  >
                    🚀 Launch Broadcast
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 6: STEADFAST & PATHAO LOGISTICS */}
          {activeTab === "courier" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Steadfast Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                        SF
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Steadfast Courier API</h4>
                        <p className="text-[11px] text-slate-500">API Key &amp; Secret Key Connected</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Auto-creates consignments upon customer address confirmation with Home Delivery or Hub Pickup selection.
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 font-mono">
                    <p className="text-slate-500 text-[10px]">Active Endpoint:</p>
                    <p className="text-slate-800">POST https://portal.steadfast.com.bd/api/v1/create_order</p>
                  </div>
                </div>

                {/* Pathao Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                        PT
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Pathao Courier API</h4>
                        <p className="text-[11px] text-slate-500">OAuth2 Token Auto-Refresh</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Supports dynamic multi-store pickup mapping, on-demand parcel dispatch, and live rider tracking sync.
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 font-mono">
                    <p className="text-slate-500 text-[10px]">Active Endpoint:</p>
                    <p className="text-slate-800">POST https://api-hermes.pathao.com/aladdin/api/v1/orders</p>
                  </div>
                </div>
              </div>

              {/* 1-Click Dispatch Table */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-slate-900">Quick Parcel Dispatch Console</h4>
                <div className="space-y-3 text-xs">
                  {orders.map((o) => (
                    <div key={o.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{o.id} • {o.customer.name} ({o.customer.phone})</p>
                        <p className="text-slate-500 text-[11px]">{o.customer.address.full_address} • COD: ৳{o.total_amount}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCourierBooking(o.id, "Steadfast")}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                        >
                          Book Steadfast
                        </button>
                        <button
                          onClick={() => handleCourierBooking(o.id, "Pathao")}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                        >
                          Book Pathao
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: META CAPI ATTRIBUTION */}
          {activeTab === "capi" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Meta Conversions API (CAPI) Server-Side Bridge</h3>
                    <p className="text-xs text-slate-500">Feeds real high-intent purchase signals directly to Meta Ads Manager.</p>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
                    Pixel ID: 889210948120
                  </span>
                </div>

                {/* Test Event Dispatch */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <p className="font-bold text-slate-900">Pre-Flight Test Event Validator</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={testEventCode}
                      onChange={(e) => setTestEventCode(e.target.value)}
                      placeholder="Test Event Code (e.g. TEST1234)"
                      className="bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-mono w-48"
                    />
                    <button
                      onClick={handleTestMetaCapi}
                      className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
                    >
                      Dispatch Test Event
                    </button>
                  </div>
                  {capiTestStatus && (
                    <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      {capiTestStatus}
                    </p>
                  )}
                </div>

                {/* Event Logs */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-800">Recent Server-Side Dispatches</h4>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                    {capiEvents.map((evt) => (
                      <div key={evt.id} className="p-3 bg-white flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{evt.eventName} • {evt.customerPhone}</p>
                          <p className="text-[11px] text-slate-500">{evt.timestamp}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{evt.value > 0 ? `৳ ${evt.value}` : "Lead Qualified"}</p>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            ✓ Status: {evt.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS & SCHEMA MAPPER */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-900">Alap AI Agent Persona &amp; Safety Guardrails</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tone &amp; Dialect Style</label>
                    <input
                      type="text"
                      defaultValue="Polite Bangladeshi E-Commerce Executive (Bangla + Banglish Fluency)"
                      className="w-full bg-slate-100 border border-slate-200 p-2.5 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Zero-Hallucination Guardrail</label>
                    <textarea
                      rows={3}
                      defaultValue="Strictly answer based on verified merchant catalog and store terms. Do not invent discounts or unlisted product sizes. When in doubt, escalate to human moderator."
                      className="w-full bg-slate-100 border border-slate-200 p-2.5 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">AI Schema Mapper Template</label>
                    <pre className="p-3 bg-slate-950 text-sky-400 rounded-xl font-mono text-[11px] overflow-x-auto">
{`{
  "order_id": "{{order.id}}",
  "customer_phone": "{{customer.phone}}",
  "recipient_address": "{{customer.address.full_address}}",
  "cod_amount": {{order.total_amount}},
  "courier_provider": "Steadfast"
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
