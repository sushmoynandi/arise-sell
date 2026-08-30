"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const team = [
  {
    name: "Alex Johnson",
    role: "Co-founder & CEO",
    bio: "3x Product Hunt #1. Former growth lead at Notion. Obsessed with launch strategy.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80",
    twitter: "#",
  },
  {
    name: "Mia Chen",
    role: "Co-founder & CTO",
    bio: "Full-stack engineer. Built platforms handling 10M+ users. Ships fast, thinks faster.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&q=80",
    twitter: "#",
  },
  {
    name: "Raj Patel",
    role: "Head of Design",
    bio: "Ex-Figma. Believes great design is invisible. Makes pixels do impossible things.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80",
    twitter: "#",
  },
  {
    name: "Sarah Kim",
    role: "Head of Growth",
    bio: "Launched 47 products on PH. Knows the algorithm. Your secret weapon on launch day.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80",
    twitter: "#",
  },
];

const milestones = [
  { year: "2023", month: "Jan", title: "The idea", description: "Alex launched his 3rd product on PH and realized every founder was building the same launch page from scratch." },
  { year: "2023", month: "Apr", title: "First prototype", description: "Built a rough MVP in 2 weeks. Shared it with 15 founder friends. 12 said they'd pay for it." },
  { year: "2023", month: "Aug", title: "Beta launch", description: "200 founders signed up in the first week. The referral waitlist feature alone drove 60% of signups." },
  { year: "2024", month: "Feb", title: "Product Hunt #1", description: "Launched HuntReady on Product Hunt. Hit #1 Product of the Day with 1,847 upvotes. Poetic." },
  { year: "2024", month: "Jul", title: "1,000 launches", description: "Crossed 1,000 products launched through our platform. 23 of them hit #1 POTD." },
  { year: "2025", month: "Now", title: "2,400+ launches", description: "Growing fast. Adding AI-powered copy, advanced analytics, and team collaboration features." },
];

const values = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      </svg>
    ),
    title: "Ship over perfect",
    description: "Done is better than perfect. We optimize for speed and iterate based on real feedback, not assumptions.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Founders first",
    description: "We build for indie hackers, not enterprises. Every feature is designed for people who wear all the hats.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="m16 10-4 4-4-4" />
      </svg>
    ),
    title: "Radically transparent",
    description: "No hidden fees, no dark patterns, no sneaky upsells. We publish our metrics, roadmap, and even our mistakes.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24">
        {/* Hero - Editorial Split */}
        <section className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh]">
            {/* Left - Text */}
            <div className="flex items-center px-4 sm:px-6 lg:px-16 py-20">
              <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-lg">
                <motion.p variants={fadeUp} className="text-sm font-bold tracking-widest uppercase text-[var(--accent)] mb-4">Our Story</motion.p>
                <motion.h1 variants={fadeUp} className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-extrabold text-[var(--foreground)] leading-[1.1] mb-6">
                  We got tired of building launch pages from scratch
                </motion.h1>
                <motion.p variants={fadeUp} className="text-lg text-[var(--muted)] leading-relaxed mb-8">
                  After launching 3 products on Product Hunt, we realized every founder wastes the same 40+ hours building the same page. Countdown timer, email capture, social proof — why rebuild it every time?
                </motion.p>
                <motion.p variants={fadeUp} className="text-lg text-[var(--foreground)] font-medium">
                  So we built HuntReady — the launch page you wished existed.
                </motion.p>
              </motion.div>
            </div>
            {/* Right - Image Collage */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-3 p-3">
                <div className="rounded-2xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=600&fit=crop&q=80" alt="Team working together" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-2xl overflow-hidden row-span-2">
                  <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=1200&fit=crop&q=80" alt="Startup workspace" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-2xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=600&h=600&fit=crop&q=80" alt="Laptop with analytics" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-[var(--foreground)] py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "2,400+", label: "Launches powered" },
                { value: "1.2M", label: "Signups collected" },
                { value: "23", label: "#1 Product of the Day" },
                { value: "4 people", label: "Team size (and growing)" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-white/50 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
              <motion.h2 variants={fadeUp} className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4">
                How we got here
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-[var(--muted)]">
                From a frustrated side project to powering thousands of launches.
              </motion.p>
            </motion.div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-[var(--border)] -translate-x-1/2" />

              <div className="space-y-12">
                {milestones.map((m, i) => (
                  <motion.div
                    key={m.title}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={fadeUp}
                    className={`relative flex flex-col md:flex-row items-start gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                  >
                    {/* Content */}
                    <div className={`flex-1 ml-16 md:ml-0 ${i % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"}`}>
                      <span className="inline-block text-xs font-bold tracking-widest uppercase text-[var(--accent)] mb-1">
                        {m.year} · {m.month}
                      </span>
                      <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--foreground)] mb-2">{m.title}</h3>
                      <p className="text-[var(--muted)] leading-relaxed">{m.description}</p>
                    </div>

                    {/* Dot */}
                    <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[var(--accent)] border-4 border-white shadow-md" />

                    {/* Spacer for other side */}
                    <div className="hidden md:block flex-1" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 lg:py-28 bg-[var(--surface-alt)]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
              <motion.h2 variants={fadeUp} className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4">
                The team behind HuntReady
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-[var(--muted)] max-w-xl mx-auto">
                Small team, big ambitions. We&apos;ve launched products ourselves — we know what it takes.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {team.map((member) => (
                <motion.div
                  key={member.name}
                  variants={fadeUp}
                  className="group bg-white rounded-2xl overflow-hidden border border-[var(--border)] hover:shadow-xl hover:shadow-[var(--accent)]/5 transition-all duration-300"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-[family-name:var(--font-display)] font-bold text-[var(--foreground)] text-lg">{member.name}</h3>
                    <p className="text-sm text-[var(--accent)] font-medium mb-2">{member.role}</p>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">{member.bio}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                <motion.h2 variants={fadeUp} className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-6 leading-tight">
                  What we believe in
                </motion.h2>
                <div className="space-y-8">
                  {values.map((v) => (
                    <motion.div key={v.title} variants={fadeUp} className="flex gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                        {v.icon}
                      </div>
                      <div>
                        <h3 className="font-[family-name:var(--font-display)] font-bold text-base sm:text-lg text-[var(--foreground)] mb-1">{v.title}</h3>
                        <p className="text-[var(--muted)] leading-relaxed">{v.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=900&fit=crop&q=80"
                    alt="Team collaboration"
                    className="w-full h-[350px] md:h-[500px] object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl border border-[var(--border)] p-5 max-w-[260px]">
                  <p className="text-sm text-[var(--foreground)] font-medium italic">
                    &ldquo;We build the tool we wished we had when we launched our first product.&rdquo;
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-2">— Alex, Co-founder</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Join Us CTA */}
        <section className="py-20 lg:py-28 bg-gradient-to-br from-[var(--accent)] to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center relative">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.h2 variants={fadeUp} className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
                Want to join our team?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-white/70 text-lg mb-10 max-w-lg mx-auto">
                We&apos;re hiring engineers, designers, and growth people who love helping founders succeed.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
                <a href="/#waitlist" className="bg-white text-[var(--accent)] font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-colors">
                  See Open Roles
                </a>
                <a href="mailto:hello@huntready.io" className="border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors">
                  Say Hello
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
