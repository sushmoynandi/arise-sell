import type { Metadata } from "next";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import Lifecycle from "@/components/marketing/Lifecycle";
import Trust from "@/components/marketing/Trust";
import CtaBand from "@/components/marketing/CtaBand";
import { Badge, Eyebrow, Panel } from "@/components/ui/primitives";
import {
  IconBox,
  IconBrain,
  IconChart,
  IconMegaphone,
  IconPipeline,
  IconPulse,
  IconThreads,
  IconTruck,
  IconWhatsApp,
  IconMessenger,
  IconInstagram,
  IconWidget,
} from "@/components/ui/icons";
import { Reveal, ScrollProgress, Stagger, StaggerItem } from "@/components/motion";

export const metadata: Metadata = {
  title: "Platform",
  description:
    "One engine across WhatsApp, Messenger, Instagram and your storefront — from the first Bangla message to the courier consignment.",
};

const CHANNELS = [
  {
    icon: IconWhatsApp,
    name: "WhatsApp",
    tint: "text-mint",
    body: "Official Cloud API through Meta, so your number is never at risk. Template messages for confirmations and tracking, campaigns with one-tap opt-out.",
    facts: ["Meta Cloud API", "Template approval flow", "0 ban risk"],
  },
  {
    icon: IconMessenger,
    name: "Messenger",
    tint: "text-azure",
    body: "DMs and comments on every post and ad. The agent replies publicly, then opens a private thread with the catalog card.",
    facts: ["Up to 5 pages", "Comment → DM", "Ad comment capture"],
  },
  {
    icon: IconInstagram,
    name: "Instagram",
    tint: "text-iris",
    body: "Direct messages, story replies and post comments. The same customer identity as Messenger, so one cart follows them.",
    facts: ["DMs + story replies", "Comment automation", "Shared identity"],
  },
  {
    icon: IconWidget,
    name: "Web widget",
    tint: "text-signal",
    body: "One script tag on your storefront. Origin-locked to your domains, and it hands the thread to the same agent your inbox uses.",
    facts: ["One script tag", "Origin allowlist", "Same agent"],
  },
];

const SURFACES = [
  { icon: IconPulse, name: "Pulse", body: "Revenue closed today, the live event stream, and the three things waiting on a human." },
  { icon: IconThreads, name: "Threads", body: "Every channel in one queue, with the guardrails that fired shown beside each reply." },
  { icon: IconPipeline, name: "Pipeline", body: "Intent moving left to right. The agent proposes each stage change; you confirm the ones worth confirming." },
  { icon: IconTruck, name: "Fulfilment", body: "Order, courier booking and the Bangla invoice on one screen — because they were never three jobs." },
  { icon: IconBox, name: "Catalog", body: "What the agent may sell, the photo index behind screenshot matching, and every feed sync with what changed." },
  { icon: IconMegaphone, name: "Reach", body: "Broadcasts, comment rules and follow-up playbooks — the three ways you start the conversation." },
  { icon: IconBrain, name: "Brain", body: "Persona, guardrails, knowledge, and the eval suite that has to pass before a change ships." },
  { icon: IconChart, name: "Signals", body: "Server-side conversion events, real return on ad spend, and an AI budget ceiling that actually stops." },
];

export default function PlatformPage() {
  return (
    <>
      <ScrollProgress />
      <SiteHeader />
      <main>
        {/* hero */}
        <section className="relative overflow-hidden pb-16 pt-32 lg:pt-40">
          <div className="bg-grid pointer-events-none absolute inset-0 mask-fade-b opacity-60" />
          <div className="relative mx-auto max-w-[1180px] px-5 lg:px-8">
            <Reveal>
              <Eyebrow>Platform</Eyebrow>
              <h1 className="mt-5 max-w-3xl text-balance font-display text-[clamp(2.2rem,4.6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
                Eight surfaces, one thread of work.
                <span className="text-text-3"> Organised by the sale, not by the feature list.</span>
              </h1>
              <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-text-2">
                Most tools in this category give you a page per module and leave the joining-up to
                you. We built the console around the five stages an order actually passes through, so
                the answer to &ldquo;where is this order&rdquo; is always one click away.
              </p>
            </Reveal>
          </div>
        </section>

        {/* channels */}
        <section id="channels" className="border-t border-line py-20 lg:py-24">
          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
            <Reveal>
              <Eyebrow>Where it listens</Eyebrow>
              <h2 className="mt-5 max-w-2xl text-balance font-display text-[clamp(1.7rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
                Four channels. One customer.
              </h2>
            </Reveal>

            <Stagger className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
              {CHANNELS.map((c) => (
                <StaggerItem key={c.name}>
                  <Panel interactive className="h-full p-6">
                    <span className="grid size-10 place-items-center rounded-xl bg-surface-2">
                      <c.icon width={19} height={19} className={c.tint} />
                    </span>
                    <h3 className="mt-4 font-display text-[19px] font-semibold tracking-tight">
                      {c.name}
                    </h3>
                    <p className="mt-2.5 text-[14px] leading-relaxed text-text-2">{c.body}</p>
                    <ul className="mt-5 flex flex-wrap gap-1.5">
                      {c.facts.map((f) => (
                        <li key={f}>
                          <Badge tone="neutral">{f}</Badge>
                        </li>
                      ))}
                    </ul>
                  </Panel>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <Lifecycle />

        {/* console surfaces */}
        <section id="fulfilment" className="border-t border-line py-20 lg:py-24">
          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
            <Reveal>
              <Eyebrow>The console</Eyebrow>
              <h2 className="mt-5 max-w-2xl text-balance font-display text-[clamp(1.7rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
                Eight places to look.
                <span className="text-text-3"> Not thirty.</span>
              </h2>
            </Reveal>

            <Stagger className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {SURFACES.map((s) => (
                <StaggerItem key={s.name} className="bg-surface">
                  <div className="h-full p-5">
                    <s.icon width={17} height={17} className="text-signal" />
                    <h3 className="mt-3.5 font-display text-[15px] font-semibold tracking-tight">
                      {s.name}
                    </h3>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-text-3">{s.body}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <Trust />
        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}
