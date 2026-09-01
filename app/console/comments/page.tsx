"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/console/PageHeader";
import { Badge, Button, Panel, PanelHead } from "@/components/ui/primitives";
import { IconPlus, IconSearch, IconCheck } from "@/components/ui/icons";
import { SPRING } from "@/components/motion";
import { COMMENT_RULES } from "@/data/operations";
import { cx } from "@/lib/format";

type CommentActivity = {
  id: string;
  postTitle: string;
  customerName: string;
  commentText: string;
  publicReply: string;
  dmSent: boolean;
  time: string;
  status: "auto_replied" | "hidden_spam";
};

const INITIAL_ACTIVITIES: CommentActivity[] = [
  {
    id: "ca-1",
    postTitle: "Eid Premium Panjabi Collection 2026",
    customerName: "Tanvir Ahmed",
    commentText: "Navy blue ta price koto? Size 42 ache?",
    publicReply: "ধন্যবাদ তানভীর ভাই! দাম ৳২,৪৫০ টাকা। বিস্তারিত ছবি ও সাইজ চার্ট আপনার ইনবক্সে পাঠানো হয়েছে।",
    dmSent: true,
    time: "3m ago",
    status: "auto_replied",
  },
  {
    id: "ca-2",
    postTitle: "Handloom Jamdani Saree (Sky Blue)",
    customerName: "Rifat Jahan",
    commentText: "Inbox please",
    publicReply: "ইনবক্স চেক করুন আপু! অফার প্রাইস ও ডেলিভারি তথ্য পাঠিয়ে দিয়েছি।",
    dmSent: true,
    time: "14m ago",
    status: "auto_replied",
  },
  {
    id: "ca-3",
    postTitle: "Leather Wallet & Belt Combo Gift Box",
    customerName: "Crypto Bot Pro",
    commentText: "Earn $500 daily check my bio!!",
    publicReply: "Hidden automatically by AI spam guard.",
    dmSent: false,
    time: "28m ago",
    status: "hidden_spam",
  },
  {
    id: "ca-4",
    postTitle: "Cotton Formal Shirt Collection",
    customerName: "Shahed Hossain",
    commentText: "Chittagong delivery koto din lagbe?",
    publicReply: "চট্টগ্রামে ২-৩ কার্যদিবসের মধ্যে ক্যাশ অন ডেলিভারি পাবেন। ইনবক্সে অর্ডার কনফার্ম করুন।",
    dmSent: true,
    time: "42m ago",
    status: "auto_replied",
  },
];

export default function CommentsPage() {
  const [rules, setRules] = useState(COMMENT_RULES);
  const [activities] = useState<CommentActivity[]>(INITIAL_ACTIVITIES);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "replied" | "spam">("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTrigger, setNewTrigger] = useState("");
  const [newPublicReply, setNewPublicReply] = useState("");
  const [newDmReply, setNewDmReply] = useState("");

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, live: !r.live } : r)),
    );
  };

  const handleAddRule = () => {
    if (!newTrigger || !newPublicReply) return;
    setRules((prev) => [
      ...prev,
      {
        id: "cr-" + Date.now(),
        trigger: newTrigger,
        reply: "Public: " + newPublicReply + " · DM: " + (newDmReply || "Auto catalog card"),
        fired: 0,
        converted: 0,
        live: true,
      },
    ]);
    setNewTrigger("");
    setNewPublicReply("");
    setNewDmReply("");
    setCreateModalOpen(false);
  };

  const totalFired = rules.reduce((a, b) => a + b.fired, 0);
  const totalConverted = rules.reduce((a, b) => a + b.converted, 0);
  const activeCount = rules.filter((r) => r.live).length;

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.customerName.toLowerCase().includes(search.toLowerCase()) ||
      act.commentText.toLowerCase().includes(search.toLowerCase()) ||
      act.postTitle.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === "replied") return act.status === "auto_replied";
    if (activeFilter === "spam") return act.status === "hidden_spam";
    return true;
  });

  return (
    <>
      <PageHeader
        title="Comments Auto-Responder"
        sub="Instant public replies and private DMs for Facebook & Instagram post comments to close sales 24/7."
        actions={
          <>
            <Badge tone="mint" dot>
              {activeCount} Active Rules
            </Badge>
            <Button
              size="sm"
              variant="signal"
              onClick={() => setCreateModalOpen(true)}
              className="gap-1.5"
            >
              <IconPlus width={14} height={14} />
              <span>New Comment Rule</span>
            </Button>
          </>
        }
      />

      <div className="space-y-6 p-5 lg:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: "Comments Auto-Replied",
              value: totalFired.toLocaleString(),
              sub: "Across all active Facebook ads & posts",
            },
            {
              label: "Orders Closed from Comments",
              value: totalConverted.toLocaleString(),
              sub: "Comment-to-DM conversion rate: 19.4%",
            },
            {
              label: "Avg. AI Response Speed",
              value: "2.4s",
              sub: "Instant public comment & private DM dispatch",
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: i * 0.06 }}
              className="rounded-2xl border border-line bg-white p-5 shadow-2xs"
            >
              <p className="text-[12.5px] text-text-3 font-medium">{s.label}</p>
              <p className="mt-1.5 font-display text-[26px] font-bold tracking-tight text-text">
                {s.value}
              </p>
              <p className="mt-1 text-[11px] text-text-3 font-mono">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-4">
            <Panel className="h-full">
              <PanelHead
                title="Auto-Reply Keyword Rules"
                sub="Public comment response and automatic private Messenger DM trigger."
              />
              <ul className="divide-y divide-line/60">
                {rules.map((r) => (
                  <li key={r.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[12px] font-bold text-text bg-surface-2 px-2 py-0.5 rounded-md border border-line">
                            {r.trigger}
                          </span>
                        </div>
                        <p className="text-[12px] text-text-3 leading-relaxed">
                          {r.reply}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleRule(r.id)}
                        className={cx(
                          "mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors cursor-pointer",
                          r.live ? "bg-signal" : "bg-surface-3",
                        )}
                        title={r.live ? "Rule Active" : "Rule Paused"}
                      >
                        <motion.span
                          layout
                          transition={SPRING}
                          className={cx(
                            "size-4 rounded-full bg-white shadow-xs",
                            r.live ? "ml-auto" : "",
                          )}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[10.5px] text-text-3 pt-1 border-t border-line/40">
                      <span>{r.fired.toLocaleString()} times fired</span>
                      <span className="text-signal font-semibold">
                        {r.converted} converted to order
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <Panel className="h-full flex flex-col">
              <div className="p-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-2/20">
                <div>
                  <h3 className="text-[14.5px] font-bold text-text">
                    Live Comment Activity Stream
                  </h3>
                  <p className="text-[11.5px] text-text-3">
                    Real-time feed of incoming post comments and AI automated actions.
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {(["all", "replied", "spam"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={cx(
                        "rounded-lg px-2.5 py-1 text-[11.5px] font-bold capitalize transition-colors cursor-pointer",
                        activeFilter === f
                          ? "bg-signal text-white"
                          : "bg-surface-2 text-text-2 hover:bg-surface-3",
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 border-b border-line bg-white flex items-center gap-2">
                <IconSearch width={14} height={14} className="text-text-3 shrink-0 ml-1" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search comments by customer name, post, or query..."
                  className="w-full text-[12.5px] bg-transparent outline-none placeholder:text-text-3"
                />
              </div>

              <div className="flex-1 divide-y divide-line/60 overflow-y-auto max-h-[520px]">
                {filteredActivities.map((act) => (
                  <div key={act.id} className="p-4 space-y-2 hover:bg-surface-2/40 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-[13px] text-text">
                          {act.customerName}
                        </span>
                        <span className="text-[11px] text-text-3 font-mono truncate">
                          on &ldquo;{act.postTitle}&rdquo;
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {act.status === "hidden_spam" ? (
                          <Badge tone="coral">Spam Hidden</Badge>
                        ) : (
                          <Badge tone="mint" dot>
                            Auto Replied
                          </Badge>
                        )}
                        <span className="font-mono text-[10.5px] text-text-3">
                          {act.time}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-surface-2/60 border border-line/60 p-2.5 text-[12px] text-text space-y-1.5">
                      <p className="font-medium text-text">
                        <span className="text-text-3 font-mono text-[11px] mr-1.5">Comment:</span>
                        &ldquo;{act.commentText}&rdquo;
                      </p>
                      <p className="text-text-2 text-[11.5px]">
                        <span className="text-signal font-semibold mr-1.5">🤖 AI Reply:</span>
                        {act.publicReply}
                      </p>
                    </div>

                    {act.dmSent && (
                      <div className="flex items-center gap-1.5 text-[11px] text-signal font-mono">
                        <IconCheck width={12} height={12} />
                        <span>Private Messenger DM dispatched with checkout link</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {createModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateModalOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-white p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h3 className="text-lg font-bold text-text">
                  Create Comment Auto-Reply Rule
                </h3>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="text-text-3 hover:text-text text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[12px] font-bold text-text mb-1">
                    When Comment Contains Keywords (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    placeholder="e.g. price, dam, koto, কত"
                    className="w-full rounded-xl border border-line px-3 py-2 text-[13px] outline-none focus:border-signal"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-text mb-1">
                    Public Comment Reply
                  </label>
                  <textarea
                    rows={2}
                    value={newPublicReply}
                    onChange={(e) => setNewPublicReply(e.target.value)}
                    placeholder="e.g. ধন্যবাদ! ইনবক্সে বিস্তারিত প্রাইস ও ডিসকাউন্ট অফার পাঠানো হয়েছে।"
                    className="w-full rounded-xl border border-line px-3 py-2 text-[13px] outline-none focus:border-signal"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-text mb-1">
                    Private Messenger DM Action
                  </label>
                  <input
                    type="text"
                    value={newDmReply}
                    onChange={(e) => setNewDmReply(e.target.value)}
                    placeholder="e.g. Send dynamic product card + 5% voucher link"
                    className="w-full rounded-xl border border-line px-3 py-2 text-[13px] outline-none focus:border-signal"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" variant="signal" onClick={handleAddRule}>
                  Save &amp; Activate Rule
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
