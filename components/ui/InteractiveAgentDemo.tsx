"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  sender: "agent" | "user" | "system";
  text: string;
  timestamp: string;
  actionCard?: {
    type: "booking" | "order" | "ticket" | "handoff";
    title: string;
    details: string;
    status: string;
  };
}

const PRESET_PROMPTS = [
  "Track my recent order #1084",
  "Book a consultation for tomorrow 3 PM",
  "What is your refund and exchange policy?",
  "Connect me with a human manager",
];

export default function InteractiveAgentDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "agent",
      text: "👋 Hi! I'm your 24/7 NextProduct AI sales and support agent. I can answer inquiries, track parcels, take orders, and qualify leads automatically.",
      timestamp: "Just now",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const lower = query.toLowerCase();

      let reply: Message;

      if (lower.includes("track") || lower.includes("order") || lower.includes("1084")) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "agent",
          text: "I found your order **#1084** in the live inventory system. It was shipped via Express Courier and is on track for delivery.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actionCard: {
            type: "order",
            title: "Order #1084 • In Transit",
            details: "ETA: Tomorrow by 2:00 PM • Courier: FedEx Air",
            status: "Auto-synced with Warehouse API",
          },
        };
      } else if (lower.includes("book") || lower.includes("consultation") || lower.includes("calendar")) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "agent",
          text: "I've checked the business calendar and reserved a 30-minute Strategy Consultation for tomorrow at 3:00 PM.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actionCard: {
            type: "booking",
            title: "Strategy Consultation Confirmed",
            details: "Tomorrow, 3:00 PM EST (Google Meet link dispatched)",
            status: "Synced with Google Calendar and CRM",
          },
        };
      } else if (lower.includes("refund") || lower.includes("policy") || lower.includes("exchange")) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "agent",
          text: "According to our company policy knowledge base: We offer a **30-day money-back guarantee** with instant self-serve returns. No hidden fees or return shipping charges.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      } else if (lower.includes("human") || lower.includes("manager") || lower.includes("escalate")) {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "agent",
          text: "I've notified the team via Slack and WhatsApp emergency dispatch. An account executive has been assigned to this ticket.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actionCard: {
            type: "handoff",
            title: "Priority Escalation Ticket #ES-92",
            details: "Assigned to Senior Account Lead • Expected response < 10 mins",
            status: "Urgent Slack and SMS Alert Sent",
          },
        };
      } else {
        reply = {
          id: (Date.now() + 1).toString(),
          sender: "agent",
          text: `I've analyzed your query regarding "${query}". As your 24/7 NextProduct AI agent, I can update customer records, resolve inquiries from documentation, or automate checkout.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      }

      setMessages((prev) => [...prev, reply]);
    }, 900);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-2 bg-slate-950 text-white text-xs px-3.5 py-2 rounded-full shadow-2xl border border-slate-800 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            Test Live 24/7 AI Agent
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-sky-500 hover:bg-sky-600 text-white p-4 rounded-full shadow-2xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center cursor-pointer border-2 border-white/50 font-bold shadow-sky-500/30"
          aria-label="Open AI Assistant"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Interactive Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[92vw] sm:w-[420px] h-[580px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-slate-950 text-white px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black text-sm shadow-md">
                  ⚡
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950"></span>
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight flex items-center gap-2">
                  NextProduct AI
                  <span className="text-[10px] bg-sky-500/20 text-sky-400 font-bold px-2 py-0.5 rounded-full">
                    24/7 Agent
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">WhatsApp • Messenger • Steadfast</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#f0f4f8]/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.sender === "user"
                      ? "bg-slate-950 text-white rounded-br-none shadow-sm"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* Action card if executed tool */}
                  {msg.actionCard && (
                    <div className="mt-2.5 p-3 rounded-xl bg-sky-50 border border-sky-200 text-slate-800 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-sky-900 flex items-center gap-1.5">
                          ✓ {msg.actionCard.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{msg.actionCard.details}</p>
                      <div className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded inline-block">
                        ⚡ {msg.actionCard.status}
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 w-fit px-3 py-2 rounded-2xl rounded-bl-none text-slate-400 shadow-sm">
                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-xs text-slate-500 ml-1">Agent verifying catalog...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {PRESET_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap text-[11px] bg-[#f0f4f8] hover:bg-sky-50 hover:text-sky-600 text-slate-700 font-medium px-2.5 py-1 rounded-full transition-colors cursor-pointer border border-slate-200 shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or simulate business task..."
              className="flex-1 text-sm bg-slate-100 text-slate-900 px-3.5 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 border border-transparent"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-bold p-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
