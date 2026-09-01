"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { IconClose, IconSend } from "@/components/ui/icons";
import { cx } from "@/lib/format";

function RobotHologram() {
  return (
    <div className="relative grid size-11 place-items-center">
      <span className="absolute inset-0 rounded-full bg-signal/10 blur-md animate-pulse" />
      <div className="robot-holo relative grid size-9 place-items-center rounded-[17px] border border-signal/30 bg-white/55 shadow-[0_16px_30px_rgba(10,110,80,0.14)] backdrop-blur-sm">
        <div className="absolute inset-[5px] rounded-[12px] border border-signal/15 bg-gradient-to-b from-white to-signal/5" />
        <div className="relative flex items-center gap-2">
          <span className="robot-eye block h-2.5 w-2.5 rounded-full bg-signal shadow-[0_0_10px_rgba(10,110,80,0.5)]" />
          <span className="robot-eye block h-2.5 w-2.5 rounded-full bg-signal shadow-[0_0_10px_rgba(10,110,80,0.5)]" />
        </div>
      </div>
    </div>
  );
}

export default function FloatingSupportAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "agent",
      text: "Hi! I can help with billing, COD, delivery, catalog updates, or order issues.",
    },
  ]);
  const [typing, setTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; size: number }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleReply = (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    setTyping(true);

    const lowercase = trimmed.toLowerCase();
    const isBilling = /bill|quota|pricing|plan|payment|invoice/.test(lowercase);
    const isDelivery = /delivery|courier|pathao|steadfast|ship|tracking/.test(
      lowercase,
    );
    const isCod = /cod|cash on delivery|cash/.test(lowercase);
    const isCatalog = /catalog|product|variant|size|stock|image/.test(
      lowercase,
    );
    const isTeam = /team|role|access|permission|account/.test(lowercase);

    const reply = isBilling
      ? "Your plan quota updates in real time. For usage and renewal questions, open Billing & Quota from the profile menu and I’ll summarize the current limits."
      : isDelivery
        ? "Orders are typically dispatched within 24–48 hours in Dhaka and 2–4 days outside Dhaka, depending on the courier and COD verification."
        : isCod
          ? "COD is available for eligible orders. Once confirmed, the rider collects payment at delivery and the order is marked as paid in the fulfilment view."
          : isCatalog
            ? "I can help check variant availability, product matching, and size guidance. If a product is missing or mismatched, the catalog review panel is the fastest place to verify it."
            : isTeam
              ? "Team access is managed from the profile menu under Team & Roles. You can assign owners, permissions, and channel coverage there."
              : "I can help with order flow, COD eligibility, shipping status, team access, or invoice details. Ask me anything specific and I’ll narrow it down.";

    window.setTimeout(() => {
      setMessages((prev) => [...prev, { from: "agent", text: reply }]);
      setTyping(false);
    }, 650);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setUploadedFiles((prev) => [
      ...prev,
      ...files.map((file) => ({
        name: file.name,
        size: file.size,
      })),
    ]);
    event.target.value = "";
  };

  const suggestions = [
    "Delivery time?",
    "COD details",
    "Billing & quota",
    "Product/size help",
  ];

  return (
    <div className="fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-[26px] border border-line bg-white shadow-[0_24px_70px_rgba(15,20,25,0.12)]"
          >
            <div className="flex items-center justify-between border-b border-line bg-surface-2 px-3.5 py-2">
              <div className="flex items-center gap-2.5">
                <RobotHologram />
                <div>
                  <p className="text-[14px] font-display font-bold tracking-[-0.02em] text-text">
                    AI Support
                  </p>
                  <p className="text-[10px] font-medium text-text-3">
                    Online now
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-text-3 hover:bg-surface hover:text-text"
                aria-label="Close support chat"
              >
                <IconClose width={15} height={15} />
              </button>
            </div>

            <div className="flex min-h-[240px] max-h-[50vh] flex-col gap-2 overflow-y-auto bg-[#f7f9f8] p-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.from}-${index}`}
                  className={cx(
                    "flex",
                    message.from === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cx(
                      "max-w-[84%] rounded-[16px] px-3 py-2 text-[12.5px] leading-relaxed",
                      message.from === "user"
                        ? "bg-signal text-white rounded-br-md"
                        : "border border-line bg-white text-text rounded-bl-md",
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {uploadedFiles.length > 0 && (
                <div className="flex justify-start">
                  <div className="max-w-[82%] rounded-[16px] border border-line bg-white px-2.5 py-1.5 text-left shadow-sm">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-text-3">
                      Attachments
                    </p>
                    <div className="mt-1.5 space-y-1">
                      {uploadedFiles.slice(-3).map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface-2 px-2 py-1"
                        >
                          <span className="truncate text-[10.5px] text-text-2">
                            {file.name}
                          </span>
                          <span className="shrink-0 text-[9px] font-mono text-text-3">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {typing && (
                <div className="flex justify-start">
                  <div className="rounded-[16px] rounded-bl-md border border-line bg-white px-2.5 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="size-1.5 animate-bounce rounded-full bg-signal/80 [animation-delay:0ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-signal/80 [animation-delay:120ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-signal/80 [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-line bg-white p-3">
              <div className="mb-2 flex flex-wrap gap-1">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleReply(suggestion)}
                    className="rounded-full border border-line bg-surface px-2 py-1 text-[10.5px] text-text-2 transition-colors hover:border-signal/25 hover:bg-signal/6 hover:text-signal"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <div className="bg-transparent p-0">
                <div className="flex items-center gap-1.5 bg-transparent px-0 py-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="grid size-8 shrink-0 place-items-center rounded-full bg-transparent text-text-2 transition-colors hover:bg-surface hover:text-signal"
                    aria-label="Attach file"
                    title="Attach file"
                  >
                    <span className="text-lg leading-none">+</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileUpload}
                  />

                  <input
                    type="text"
                    placeholder="Ask about order, COD, delivery, invoice…"
                    className="h-8 flex-1 border-0 bg-transparent px-1 text-[12px] text-text placeholder:text-text-3 focus:outline-none"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        const target = event.target as HTMLInputElement;
                        handleReply(target.value);
                        target.value = "";
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="grid size-8 shrink-0 place-items-center rounded-full bg-signal text-white shadow-[0_10px_20px_rgba(10,110,80,0.2)]"
                    onClick={(event) => {
                      const input = event.currentTarget
                        .previousElementSibling as HTMLInputElement | null;
                      if (input) {
                        handleReply(input.value);
                        input.value = "";
                      }
                    }}
                    aria-label="Send message"
                    title="Send message"
                  >
                    <IconSend width={15} height={15} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-full border border-signal/30 bg-signal px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_14px_25px_rgba(10,110,80,0.25)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <span className="robot-holo relative grid size-7 place-items-center rounded-full border border-white/80 bg-white/90 shadow-[0_5px_14px_rgba(255,255,255,0.25)]">
          <span className="absolute inset-[3px] rounded-full border border-signal/10 bg-gradient-to-b from-white to-signal/5" />
          <span className="relative flex items-center gap-1.5">
            <span className="robot-eye size-1.5 rounded-full bg-signal" />
            <span className="robot-eye size-1.5 rounded-full bg-signal" />
          </span>
        </span>
        AI Help
      </button>
    </div>
  );
}
