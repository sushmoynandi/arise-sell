"use client";

import { useState } from "react";
import { cx } from "@/lib/format";

type Message = {
  id: string;
  sender: "customer" | "ai";
  text: string;
  time: string;
  intent?: string;
  productMatch?: {
    name: string;
    price: number;
    stock: number;
  };
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    sender: "ai",
    text: "আসসালামু আলাইকুম! Nazmul's Fashion House এ আপনাকে স্বাগতম। আজকে আপনাকে কীভাবে সাহায্য করতে পারি?",
    time: "10:30 AM",
  },
  {
    id: "m2",
    sender: "customer",
    text: "আপনাদের প্রিমিয়াম পাঞ্জাবির দাম কত? সাইজ ৪০ আছে?",
    time: "10:31 AM",
  },
  {
    id: "m3",
    sender: "ai",
    text: "আমাদের Royal Silk Panjabi এর দাম ৳২,৪৫০ টাকা। সাইজ ৪০ (Medium) বর্তমানে স্টকে আছে! ডেলিভারির জন্য আপনার নাম, ঠিকানা ও ফোন নাম্বারটি দিবেন কি?",
    time: "10:31 AM",
    intent: "Product Inquiry + Price Quotation",
    productMatch: {
      name: "Royal Silk Panjabi (Navy Blue, Size 40)",
      price: 2450,
      stock: 14,
    },
  },
];

export default function TestAIPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const newMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "customer",
      text: userText,
      time: "Just now",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let reply =
        "জি ধন্যবাদ! আপনার অর্ডারটি আমরা কনফার্ম করছি। Steadfast Courier এ পার্সেল বুক করা হয়েছে।";
      let intent = "General Inquiry";

      if (
        userText.includes("দাম") ||
        userText.includes("price") ||
        userText.includes("কত")
      ) {
        reply =
          "এই প্রোডাক্টটির রেগুলার প্রাইস ৳২,৪৫০ টাকা, আজকের স্পেশাল অফারে পাবেন ৳১,৯৫০ টাকায়। ডেলিভারি চার্জ ঢাকার ভেতরে ৳৭০, ঢাকার বাইরে ৳১৩০। অর্ডার করতে চান?";
        intent = "Price & Offer Inquiry";
      } else if (
        userText.includes("অর্ডার") ||
        userText.includes("order") ||
        userText.includes("ঠিকানা") ||
        userText.includes("01")
      ) {
        reply =
          "অসাধারণ! আপনার অর্ডারটি সফলভাবে রিসিভ করা হয়েছে। মোট বিল: ৳২,০২০ (পণ্য ৳১,৯৫০ + ডেলিভারি ৳৭০)। ক্যাশ অন ডেলিভারিতে ২-৩ দিনের মধ্যে ডেলিভারি পাবেন।";
        intent = "Order Confirmation & COD Auto-Entry";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: reply,
          time: "Just now",
          intent,
        },
      ]);
    }, 800);
  };

  return (
    <div className="p-5 sm:p-7 lg:p-9 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-text tracking-tight flex items-center gap-2">
            <span>Test Your AI Assistant</span>
            <span className="rounded-full bg-signal/15 text-signal text-[11px] font-mono font-bold px-2.5 py-0.5">
              Live Sandbox
            </span>
          </h1>
          <p className="text-[13px] text-text-3 mt-0.5">
            Test how your AI bot talks to customers in Bangla & Banglish,
            answers product questions, and takes orders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMessages(INITIAL_MESSAGES)}
          className="rounded-xl border border-line bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-text hover:bg-surface-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          ↻ Reset Sandbox
        </button>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Simulator */}
        <div className="lg:col-span-2 rounded-2xl border border-line bg-white shadow-2xs flex flex-col h-[560px]">
          {/* Simulator Bar */}
          <div className="p-4 border-b border-line flex items-center justify-between bg-surface-2/30 rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-full bg-signal text-white grid place-items-center font-bold text-sm">
                🤖
              </div>
              <div>
                <p className="text-[13px] font-bold text-text leading-tight">
                  NextProduct Sales Bot (Bangla NLU)
                </p>
                <p className="text-[10.5px] text-signal font-mono">
                  ● Persona: Friendly & Polite Sales Closer
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-text-3">
              Latency: 140ms
            </span>
          </div>

          {/* Chat Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cx(
                  "flex flex-col max-w-[85%]",
                  m.sender === "customer" ? "ml-auto items-end" : "items-start",
                )}
              >
                <div
                  className={cx(
                    "rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-2xs",
                    m.sender === "customer"
                      ? "bg-signal text-white rounded-br-xs"
                      : "bg-surface-2 text-text border border-line/60 rounded-bl-xs",
                  )}
                >
                  {m.text}
                </div>

                {m.intent && (
                  <div className="mt-1 flex items-center gap-1.5 text-[10.5px] font-mono text-text-3">
                    <span className="size-1.5 rounded-full bg-signal" />
                    <span>AI Intent: {m.intent}</span>
                  </div>
                )}

                {m.productMatch && (
                  <div className="mt-2 rounded-xl border border-signal/30 bg-signal/5 p-2.5 text-[11.5px] w-full text-left space-y-1">
                    <p className="font-bold text-signal">
                      🎯 Matched Product from Catalog:
                    </p>
                    <p className="text-text font-medium">
                      {m.productMatch.name}
                    </p>
                    <p className="text-text-3 font-mono">
                      Price: ৳{m.productMatch.price} · Stock:{" "}
                      {m.productMatch.stock} units
                    </p>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-text-3 text-[12px] bg-surface-2 w-fit px-3 py-1.5 rounded-full">
                <span className="size-1.5 rounded-full bg-signal animate-bounce" />
                <span className="size-1.5 rounded-full bg-signal animate-bounce [animation-delay:0.2s]" />
                <span className="size-1.5 rounded-full bg-signal animate-bounce [animation-delay:0.4s]" />
                <span>AI is thinking...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-line flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type in Bangla or English (e.g. দাম কত?, অর্ডার করবো)..."
              className="flex-1 rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-[13px] text-text placeholder:text-text-3/60 focus:bg-white focus:border-signal focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="rounded-xl bg-signal px-4 py-2.5 text-[13px] font-bold text-white shadow-xs hover:bg-signal-deep disabled:opacity-50 transition-all cursor-pointer"
            >
              Send ➔
            </button>
          </form>
        </div>

        {/* Right 1 Col: Quick Simulation Triggers */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-2xs space-y-3">
            <h3 className="text-[13.5px] font-bold text-text">
              ⚡ Quick Test Scenarios
            </h3>
            <p className="text-[12px] text-text-3">
              Click any scenario to instantly test your AI bot&apos;s reaction:
            </p>

            <div className="space-y-2">
              {[
                { label: "Price Inquiry", text: "এইটার প্রাইস কত?" },
                {
                  label: "Size Availability",
                  text: "XL সাইজ কি এভেইলেবল আছে?",
                },
                { label: "Delivery Charge", text: "চিটাগং ডেলিভারি চার্জ কত?" },
                {
                  label: "Complete Order",
                  text: "আমি ২টা নিবো, ঠিকানা: ধানমন্ডি ২৭, ঢাকা, 01711234567",
                },
              ].map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setInput(s.text)}
                  className="w-full text-left rounded-xl border border-line bg-canvas/30 p-2.5 text-[12px] hover:border-signal/50 hover:bg-signal/[0.03] transition-all cursor-pointer group"
                >
                  <p className="font-semibold text-text group-hover:text-signal">
                    {s.label}
                  </p>
                  <p className="text-text-3 truncate mt-0.5 font-mono text-[11px]">
                    {s.text}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface-2/40 p-4 text-[12px] text-text-3 space-y-1.5">
            <p className="font-bold text-text">💡 How to improve responses?</p>
            <p>
              Go to <strong>AI Knowledge Base</strong> to teach your bot your
              return policy, discounts, and brand tone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
