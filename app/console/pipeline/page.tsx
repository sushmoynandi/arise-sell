"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import PageHeader from "@/components/console/PageHeader";
import { Badge, Button, ChannelChip, Meter } from "@/components/ui/primitives";
import { IconCheck, IconClock, IconSpark } from "@/components/ui/icons";
import { SPRING, SPRING_POP } from "@/components/motion";
import { PIPELINE, STAGES } from "@/data/operations";
import type { PipelineCard, Stage } from "@/data/types";
import { bdt, cx } from "@/lib/format";

const AGE = (m: number) => (m < 60 ? `${m}m` : `${Math.round(m / 60)}h`);

function Card({
  card,
  onConfirm,
  onReject,
}: {
  card: PipelineCard;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const hot = card.confidence >= 0.9;
  return (
    <motion.article
      layout
      layoutId={card.id}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={SPRING}
      className={cx(
        "panel edge-lift group cursor-grab p-3.5 active:cursor-grabbing",
        card.proposal && "border-[color:var(--signal-line)]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium leading-snug text-text">
          {card.customer}
        </p>
        <span
          className={cx(
            "shrink-0 font-mono text-[10px]",
            hot
              ? "text-signal"
              : card.confidence < 0.5
                ? "text-coral"
                : "text-text-3",
          )}
        >
          {Math.round(card.confidence * 100)}%
        </span>
      </div>

      <p className="mt-1 truncate text-[11.5px] text-text-3">{card.product}</p>

      <div className="mt-2.5">
        <Meter
          value={card.confidence * 100}
          max={100}
          tone={hot ? "signal" : card.confidence < 0.5 ? "coral" : "amber"}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="font-display text-[15px] font-semibold tracking-tight text-text">
          {bdt(card.value, { compact: card.value > 99999 })}
        </span>
        <span className="flex items-center gap-1 font-mono text-[10px] text-text-3">
          <IconClock width={10} height={10} />
          {AGE(card.ageMins)}
        </span>
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-line-soft pt-2.5">
        <ChannelChip channel={card.channel} />
        {card.waitingOn && (
          <span className="truncate text-[10.5px] text-amber">
            {card.waitingOn}
          </span>
        )}
      </div>

      <AnimatePresence>
        {card.proposal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={SPRING}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-lg border border-[color:var(--signal-line)] bg-signal-wash p-2.5">
              <p className="flex items-center gap-1.5 font-mono text-[10px] text-signal">
                <IconSpark width={10} height={10} />
                MOVE TO {card.proposal.to.toUpperCase()}
              </p>
              <p className="mt-1.5 text-[11px] leading-snug text-text-2">
                {card.proposal.why}
              </p>
              <div className="mt-2.5 flex gap-1.5">
                <button
                  onClick={() => onConfirm(card.id)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-md bg-signal py-1.5 text-[11.5px] font-medium text-signal-ink transition-opacity hover:opacity-90"
                >
                  <IconCheck width={11} height={11} />
                  Confirm
                </button>
                <button
                  onClick={() => onReject(card.id)}
                  className="rounded-md bg-surface-3 px-2.5 py-1.5 text-[11.5px] text-text-2 transition-colors hover:text-text"
                >
                  Not yet
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default function PipelinePage() {
  const [cards, setCards] = useState<PipelineCard[]>(PIPELINE);

  const confirm = (id: string) =>
    setCards((prev) =>
      prev.map((c) =>
        c.id === id && c.proposal
          ? { ...c, stage: c.proposal.to, proposal: undefined }
          : c,
      ),
    );

  const reject = (id: string) =>
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, proposal: undefined } : c)),
    );

  const byStage = useMemo(() => {
    const m = new Map<Stage, PipelineCard[]>();
    for (const s of STAGES) m.set(s.id, []);
    for (const c of cards) m.get(c.stage)?.push(c);
    return m;
  }, [cards]);

  const open = cards
    .filter((c) => c.stage !== "settled" && c.stage !== "lost")
    .reduce((a, c) => a + c.value, 0);
  const pending = cards.filter((c) => c.proposal).length;

  return (
    <>
      <PageHeader
        title="Leads & Pipeline"
        sub="Customer purchase intent stages, automated follow-ups, and confirmed order conversions."
        actions={
          <>
            <Badge tone="signal">{bdt(open, { compact: true })} open</Badge>
            {pending > 0 && (
              <Badge tone="amber" dot>
                {pending} awaiting confirm
              </Badge>
            )}
          </>
        }
      />

      <div className="overflow-x-auto p-5 lg:p-8">
        <LayoutGroup>
          <div className="flex min-w-max gap-4">
            {STAGES.map((stage, si) => {
              const items = byStage.get(stage.id) ?? [];
              const total = items.reduce((a, c) => a + c.value, 0);
              return (
                <motion.section
                  key={stage.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...SPRING, delay: si * 0.06 }}
                  className="flex w-[262px] shrink-0 flex-col"
                >
                  <header className="mb-3 flex items-baseline justify-between border-b border-line pb-2.5">
                    <div>
                      <h2 className="font-display text-[14px] font-semibold tracking-tight text-text">
                        {stage.label}
                        <span className="ml-1.5 font-mono text-[11px] font-normal text-text-3">
                          {items.length}
                        </span>
                      </h2>
                      <p className="mt-0.5 text-[10.5px] text-text-3">
                        {stage.note}
                      </p>
                    </div>
                    {total > 0 && (
                      <span className="shrink-0 font-mono text-[10.5px] text-text-3">
                        {bdt(total, { compact: true })}
                      </span>
                    )}
                  </header>

                  <div className="min-h-[120px] space-y-2.5">
                    <AnimatePresence mode="popLayout">
                      {items.map((c) => (
                        <Card
                          key={c.id}
                          card={c}
                          onConfirm={confirm}
                          onReject={reject}
                        />
                      ))}
                    </AnimatePresence>
                    {items.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={SPRING_POP}
                        className="rounded-xl border border-dashed border-line px-3 py-8 text-center"
                      >
                        <p className="text-[11.5px] text-text-3">
                          Nothing here
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.section>
              );
            })}
          </div>
        </LayoutGroup>
      </div>

      <div className="border-t border-line px-5 py-5 lg:px-8">
        <div className="panel flex flex-wrap items-center gap-x-8 gap-y-4 p-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-3">
              Stage conversion
            </p>
            <p className="mt-1.5 text-[13px] text-text-2">
              Listening → Confirmed sits at{" "}
              <span className="font-medium text-signal">38.4%</span> this week,
              up from 31.2%.
            </p>
          </div>
          <div className="h-8 w-px bg-line" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-3">
              Biggest leak
            </p>
            <p className="mt-1.5 text-[13px] text-text-2">
              <span className="font-medium text-coral">
                Details → Confirmed
              </span>{" "}
              — 22% never send an address.
            </p>
          </div>
          <Button size="sm" variant="outline" className="ml-auto">
            Open the rescue playbook
          </Button>
        </div>
      </div>
    </>
  );
}
