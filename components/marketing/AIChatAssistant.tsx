"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SPRING_SOFT } from "@/components/motion";
import { IconCheck, IconSpark, IconWhatsApp } from "@/components/ui/icons";

const starterMessages = [
  {
    from: "customer",
    text: "Vai, blue hoodie ta ache? size L lagbe.",
  },
  {
    from: "agent",
    text: "Ache, Blue Harbor Hoodie size L stock e ache. ৳2,490. Order kore diben?",
  },
  {
    from: "customer",
    text: "Haan, cash on delivery e hobe?",
  },
];

const quickReplies = [
  "Show latest collection",
  "Delivery time?",
  "Can I pay COD?",
  "Need size guide",
];

export default function AIChatAssistant() {
  const [messages, setMessages] = useState(starterMessages);
  const [typing, setTyping] = useState(false);

  const handleReply = (suggestion: string) => {
    const customerMessage = {
      from: "customer",
      text: suggestion,
    };

    setMessages((prev) => [...prev, customerMessage]);
    setTyping(true);

    const delay = suggestion.includes("delivery") ? 1100 : 900;

    setTimeout(() => {
      const responder = suggestion.includes("delivery")
        ? "Delivery within Dhaka 24–48 hrs. Outside Dhaka 2–4 days."
        : suggestion.includes("COD")
          ? "Haan, COD available on eligible orders. After confirmation, delivery agent will collect from customer."
          : suggestion.includes("size")
            ? "Size guide: S = 38–40, M = 40–42, L = 42–44, XL = 44–46."
            : "Yes, latest drop is live. I can recommend 3 bestsellers based on your style and budget.";

      setMessages((prev) => [
        ...prev,
        {
          from: "agent",
          text: responder,
        },
      ]);
      setTyping(false);
    }, delay);
  };

  return (
    <section className="relative border-t border-line bg-[#f7f9f7] py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={SPRING_SOFT}
          className="flex flex-col justify-center"
        >
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-signal/20 bg-signal/8 px-3 py-1.5 text-[12px] font-semibold text-signal">
            <IconSpark width={12} height={12} />
            AI sales assistant
          </span>

          <h2 className="mt-5 max-w-lg font-display text-[clamp(2.1rem,4vw,3.2rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-text">
            Your storefront talks, qualifies, and closes — without waiting for a
            human.
          </h2>

          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-text-2">
            Merchants don&apos;t need another bot. They need an always-on sales
            teammate that reads the customer, matches the product, confirms the
            order, and pushes the delivery through the same chat.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Average reply", value: "3.2s" },
              { label: "Orders closed", value: "24/7" },
              { label: "COD flow", value: "Built-in" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(15,20,25,0.04)]"
              >
                <p className="font-display text-[28px] font-semibold tracking-tight text-text">
                  {item.value}
                </p>
                <p className="mt-1 text-[12.5px] text-text-3">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...SPRING_SOFT, delay: 0.1 }}
          className="relative"
        >
          <div
            className="absolute -inset-3 -z-10 rounded-[28px] bg-signal/8 blur-2xl"
            aria-hidden
          />

          <div className="overflow-hidden rounded-[26px] border border-line bg-white shadow-[0_8px_24px_rgba(15,20,25,0.06)]">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-full bg-signal/10 text-signal">
                  <IconWhatsApp width={16} height={16} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-text">
                    Nokshi & Co.
                  </p>
                  <p className="text-[10.5px] text-text-3">
                    AI sales assistant
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1 rounded-full border border-signal/20 bg-signal/8 px-2 py-1 text-[10px] font-semibold text-signal">
                <span className="size-1.5 rounded-full bg-signal" />
                online
              </span>
            </div>

            <div className="space-y-3 bg-[#f6f8f7] p-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.from}-${index}`}
                  className={`flex ${message.from === "agent" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                      message.from === "agent"
                        ? "rounded-tr-sm bg-signal text-white"
                        : "rounded-tl-sm border border-line bg-white text-text"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-tr-sm bg-signal px-3 py-2.5 text-white">
                    <div className="flex items-center gap-1.5">
                      <span className="size-1.5 animate-bounce rounded-full bg-white/80 [animation-delay:0ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-white/80 [animation-delay:120ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-white/80 [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-line bg-white p-3">
              <div className="mb-3 flex flex-wrap gap-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => handleReply(reply)}
                    className="rounded-full border border-line bg-surface px-2.5 py-1 text-[11.5px] text-text-2 transition-colors hover:border-signal/20 hover:bg-signal/6 hover:text-signal"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface-2 px-3 py-2.5">
                <p className="text-[12.5px] text-text-3">
                  Type your message...
                </p>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full bg-signal px-3 py-1.5 text-[11.5px] font-semibold text-white shadow-[0_2px_8px_rgba(10,110,80,0.25)]"
                >
                  <IconCheck width={12} height={12} />
                  Send
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
