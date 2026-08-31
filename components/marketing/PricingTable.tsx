"use client";

import { motion } from "framer-motion";
import { Badge, Button, Panel } from "@/components/ui/primitives";
import { IconCheck, IconClose } from "@/components/ui/icons";
import { Counter, Magnetic, SPRING, Stagger, StaggerItem } from "@/components/motion";
import { ENTERPRISE, OVERAGE, PLANS } from "@/data/plans";
import { cx } from "@/lib/format";

export default function PricingTable() {
  return (
    <>
      <Stagger className="grid grid-cols-1 gap-4 lg:grid-cols-3" amount={0.05}>
        {PLANS.map((p) => (
          <StaggerItem key={p.id}>
            <Panel
              className={cx(
                "relative flex h-full flex-col p-6",
                p.featured && "border-[color:var(--signal-line)]"
              )}
            >
              {p.featured && (
                <>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-px -z-10 rounded-[14px] opacity-40 blur-xl"
                    style={{ background: "radial-gradient(60% 50% at 50% 0%, rgba(10,110,80,0.16), transparent)" }}
                  />
                  <Badge tone="signal" className="absolute -top-2.5 left-6">
                    Most shops start here
                  </Badge>
                </>
              )}

              <div className="flex items-baseline gap-2">
                <h3 className="font-display text-[21px] font-semibold tracking-tight text-text">
                  {p.name}
                </h3>
                <span className="font-[family-name:var(--font-hind)] text-[14px] text-text-3">
                  {p.nameBn}
                </span>
              </div>
              <p className="mt-2 min-h-[40px] text-[13px] leading-snug text-text-3">{p.blurb}</p>

              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-[40px] font-semibold leading-none tracking-tight text-text">
                  ৳<Counter to={p.price} />
                </span>
                <span className="text-[13px] text-text-3">{p.period}</span>
              </div>

              <div className="mt-4 rounded-lg border border-line bg-surface-2/60 px-3.5 py-2.5">
                <p className="font-display text-[17px] font-semibold tracking-tight text-signal">
                  {p.orders.toLocaleString()} closed orders
                </p>
                <p className="mt-0.5 text-[11.5px] text-text-3">included every month</p>
              </div>

              <div className="mt-6">
                <Magnetic strength={0.15} className="w-full">
                  <Button
                    href="/console"
                    variant={p.featured ? "signal" : "outline"}
                    size="lg"
                    className="w-full"
                  >
                    {p.cta}
                  </Button>
                </Magnetic>
              </div>

              <ul className="mt-7 space-y-2.5">
                {p.features.map((f, i) => (
                  <motion.li
                    key={f}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ ...SPRING, delay: i * 0.03 }}
                    className="flex items-start gap-2.5"
                  >
                    <IconCheck width={13} height={13} className="mt-0.5 shrink-0 text-signal" />
                    <span className="text-[13px] leading-snug text-text-2">{f}</span>
                  </motion.li>
                ))}
                {p.absent.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 opacity-45">
                    <IconClose width={13} height={13} className="mt-0.5 shrink-0 text-text-3" />
                    <span className="text-[13px] leading-snug text-text-3 line-through">{f}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <Panel className="flex flex-wrap items-center gap-x-8 gap-y-4 p-6">
          <div className="min-w-[220px] flex-1">
            <h3 className="font-display text-[19px] font-semibold tracking-tight">
              {ENTERPRISE.name}
            </h3>
            <p className="mt-1.5 max-w-lg text-[13px] leading-snug text-text-3">
              {ENTERPRISE.blurb}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {ENTERPRISE.points.map((pt) => (
                <li key={pt}>
                  <Badge tone="neutral">{pt}</Badge>
                </li>
              ))}
            </ul>
          </div>
          <Button href="https://wa.me/8801710000000" target="_blank" variant="outline" size="lg">
            Talk to us
          </Button>
        </Panel>
      </div>

      <p className="mt-6 text-center font-mono text-[12px] text-text-3">{OVERAGE}</p>
    </>
  );
}
