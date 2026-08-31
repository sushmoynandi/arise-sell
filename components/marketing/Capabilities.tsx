"use client";

import { motion } from "framer-motion";
import { Badge, Eyebrow, LiveDot, Meter, Sparkline } from "@/components/ui/primitives";
import {
  IconBolt,
  IconEye,
  IconGlobe,
  IconInstagram,
  IconMessenger,
  IconShield,
  IconTruck,
  IconWhatsApp,
  IconWidget,
} from "@/components/ui/icons";
import { Reveal, Stagger, StaggerItem, Tilt, SPRING } from "@/components/motion";
import { CHANNELS } from "@/data/tenant";
import { SERIES } from "@/data/operations";

const CHANNEL_ICONS = {
  whatsapp: IconWhatsApp,
  messenger: IconMessenger,
  instagram: IconInstagram,
  web: IconWidget,
  telegram: IconGlobe,
} as const;

export default function Capabilities() {
  return (
    <section id="channels" className="relative border-t border-line py-24 lg:py-32">
      <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
        <Reveal>
          <Eyebrow>What it actually does</Eyebrow>
          <h2 className="mt-5 max-w-2xl text-balance font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-semibold leading-[1.08] tracking-[-0.025em]">
            Six things a good shop assistant does.
            <span className="text-text-3"> All six, at 3am, in Bangla.</span>
          </h2>
        </Reveal>

        <Stagger className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-6">
          {/* --- channels : wide --- */}
          <StaggerItem className="md:col-span-4">
            <Tilt max={4}>
              <div className="panel edge-lift h-full overflow-hidden p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-[19px] font-semibold tracking-tight">
                      Every channel, one thread
                    </h3>
                    <p className="mt-2 max-w-md text-[14px] leading-relaxed text-text-2">
                      The same customer on Messenger this morning and WhatsApp tonight is one person
                      with one cart — not two strangers starting over.
                    </p>
                  </div>
                  <LiveDot />
                </div>

                <div className="mt-7 space-y-2.5">
                  {CHANNELS.filter((c) => c.live).map((c, i) => {
                    const Icon = CHANNEL_ICONS[c.id as keyof typeof CHANNEL_ICONS];
                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, x: -14 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ ...SPRING, delay: 0.08 * i }}
                        className="flex items-center gap-3"
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-text-2">
                          <Icon width={15} height={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-[13.5px] font-medium text-text">{c.label}</span>
                            <span className="font-mono text-[11px] text-text-3">{c.share}%</span>
                          </div>
                          <div className="mt-1.5">
                            <Meter value={c.share} max={50} />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </Tilt>
          </StaggerItem>

          {/* --- vision : tall --- */}
          <StaggerItem className="md:col-span-2">
            <div className="panel edge-lift flex h-full flex-col justify-between overflow-hidden p-6">
              <div>
                <span className="grid size-9 place-items-center rounded-xl bg-iris/12 text-iris">
                  <IconEye width={17} height={17} />
                </span>
                <h3 className="mt-4 font-display text-[19px] font-semibold tracking-tight">
                  Screenshot → SKU
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-text-2">
                  Customers send a cropped photo of your own post. It comes back as a variant, in
                  stock, with a price.
                </p>
              </div>
              <div className="mt-6 rounded-xl border border-line bg-surface-2/60 p-3">
                <div className="flex items-center justify-between font-mono text-[10.5px] text-text-3">
                  <span>MATCH</span>
                  <span className="text-iris">0.94</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <motion.div
                    className="h-full rounded-full bg-iris"
                    initial={{ width: 0 }}
                    whileInView={{ width: "94%" }}
                    viewport={{ once: true }}
                    transition={{ ...SPRING, delay: 0.3 }}
                  />
                </div>
                <p className="mt-2.5 font-mono text-[11px] text-text-2">JD-IND · Indigo · 12 left</p>
              </div>
            </div>
          </StaggerItem>

          {/* --- courier --- */}
          <StaggerItem className="md:col-span-2">
            <div className="panel edge-lift h-full p-6">
              <span className="grid size-9 place-items-center rounded-xl bg-mint/12 text-mint">
                <IconTruck width={17} height={17} />
              </span>
              <h3 className="mt-4 font-display text-[19px] font-semibold tracking-tight">
                Courier, not clipboard
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-text-2">
                Steadfast and Pathao booked on your own merchant account. COD lands in your wallet.
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                <Badge tone="mint" dot>
                  Steadfast
                </Badge>
                <Badge tone="azure" dot>
                  Pathao
                </Badge>
                <Badge tone="neutral">1-click bulk</Badge>
              </div>
            </div>
          </StaggerItem>

          {/* --- guardrails --- */}
          <StaggerItem className="md:col-span-2">
            <div className="panel edge-lift h-full p-6">
              <span className="grid size-9 place-items-center rounded-xl bg-amber/12 text-amber">
                <IconShield width={17} height={17} />
              </span>
              <h3 className="mt-4 font-display text-[19px] font-semibold tracking-tight">
                It knows when to stop
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-text-2">
                Never claims stock it can&apos;t see. Never invents a delivery date. Hands bulk and
                discounts to a human.
              </p>
              <p className="mt-5 font-mono text-[11px] text-text-3">
                <span className="text-amber">6.4%</span> of threads escalated last week
              </p>
            </div>
          </StaggerItem>

          {/* --- growth --- */}
          <StaggerItem className="md:col-span-2">
            <div className="panel edge-lift flex h-full flex-col p-6">
              <span className="grid size-9 place-items-center rounded-xl bg-signal-wash text-signal">
                <IconBolt width={17} height={17} />
              </span>
              <h3 className="mt-4 font-display text-[19px] font-semibold tracking-tight">
                Ads that learn
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-text-2">
                Purchases go server-side to Meta, so the campaign that started the chat finds more
                people like that buyer.
              </p>
              <div className="mt-auto pt-5">
                <Sparkline data={SERIES.revenue} height={40} />
              </div>
            </div>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
