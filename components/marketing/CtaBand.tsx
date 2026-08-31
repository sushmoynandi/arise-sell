"use client";

import { Button } from "@/components/ui/primitives";
import { IconArrow } from "@/components/ui/icons";
import { Magnetic, Reveal } from "@/components/motion";
import { OVERAGE } from "@/data/plans";

export default function CtaBand() {
  return (
    <section className="relative overflow-hidden border-t border-line py-24 lg:py-28">
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-60" />
      <div
        aria-hidden
        className="anim-aurora pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(10,110,80,0.10), transparent 66%)" }}
      />

      <div className="relative mx-auto max-w-[1180px] px-5 text-center lg:px-8">
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-balance font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
            Point it at your catalog.
            <br />
            <span className="text-text-3">Watch it close forty orders free.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-text-2">
            No card, no sales call, no migration. Connect one channel, sync your feed, and read the
            transcripts yourself.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Magnetic>
            <Button href="/console" size="lg" className="group">
              Open the live console
              <IconArrow
                width={16}
                height={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Button>
          </Magnetic>
          <Magnetic strength={0.2}>
            <Button href="/docs" size="lg" variant="outline">
              Read the feed spec
            </Button>
          </Magnetic>
        </Reveal>

        <Reveal delay={0.18}>
          <p className="mt-7 font-mono text-[11.5px] text-text-3">{OVERAGE}</p>
        </Reveal>
      </div>
    </section>
  );
}
