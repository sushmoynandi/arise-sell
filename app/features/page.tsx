"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const featureShowcases = [
  {
    tag: "Countdown & Hype",
    title: "Build anticipation that converts",
    description:
      "A live countdown timer that creates urgency. When launch day hits, it automatically switches to a Product Hunt voting button — zero manual work.",
    points: [
      "Auto-switches to PH vote CTA on launch day",
      "Customizable timezone and launch date",
      "Animated, attention-grabbing design",
    ],
    image:
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=600&fit=crop&q=80",
    imageAlt: "Countdown timer on laptop screen",
  },
  {
    tag: "Referral Waitlist",
    title: "Turn signups into your marketing team",
    description:
      "Every person who joins your waitlist gets a unique referral link. They move up the list by inviting friends — creating a viral loop that grows your audience without ad spend.",
    points: [
      "Unique referral link per signup",
      "Position tracker shows real-time rank",
      "Average 2.7 referrals per person",
    ],
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&q=80",
    imageAlt: "Team collaboration and growth",
  },
  {
    tag: "Demo Embed",
    title: "Show, don't tell — embed your product demo",
    description:
      "Drop in a Loom walkthrough, YouTube video, or interactive demo. Visitors who see your product in action are 3x more likely to sign up.",
    points: [
      "Supports Loom, YouTube, Vimeo embeds",
      "Custom thumbnail with play button",
      "Responsive across all devices",
    ],
    image:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop&q=80",
    imageAlt: "Product demo on screen",
  },
  {
    tag: "Press Kit",
    title: "Make journalists' jobs easy",
    description:
      "A ready-to-download press kit with your brand assets, screenshots, product copy, and founder bio. When TechCrunch comes knocking, you're ready.",
    points: [
      "One-click download of all assets",
      "Brand guidelines included",
      "Pre-written product descriptions",
    ],
    image:
      "https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=800&h=600&fit=crop&q=80",
    imageAlt: "Press and media coverage",
  },
];

const bentoFeatures = [
  {
    title: "Founder Story Section",
    description: "Share your journey. Personal stories convert 22% better than feature lists alone.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
      </svg>
    ),
    color: "bg-violet-100 text-violet-600",
    span: "col-span-1",
  },
  {
    title: "Social Proof Badges",
    description: "Show real signup numbers, avatar stacks, and testimonial quotes to build instant trust.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "bg-amber-100 text-amber-600",
    span: "col-span-1 md:col-span-2",
  },
  {
    title: "Analytics Dashboard",
    description: "Track signups, referral rates, conversion funnels, and traffic sources in real time.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
    color: "bg-emerald-100 text-emerald-600",
    span: "col-span-1 md:col-span-2",
  },
  {
    title: "Custom Domain",
    description: "Launch on your own domain. YourProduct.com/launch looks way more legit.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    color: "bg-rose-100 text-rose-600",
    span: "col-span-1",
  },
  {
    title: "Email Integrations",
    description: "Auto-sync signups to Mailchimp, ConvertKit, Resend, or any email tool via webhooks.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    color: "bg-cyan-100 text-cyan-600",
    span: "col-span-1",
  },
  {
    title: "A/B Testing",
    description: "Test different headlines, CTAs, and layouts. Know what converts before launch day.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5" /><path d="M8 3H3v5" /><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" /><path d="m15 9 6-6" />
      </svg>
    ),
    color: "bg-indigo-100 text-indigo-600",
    span: "col-span-1",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24">
        {/* Hero - Diagonal Split */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[var(--accent-light)] via-white to-[var(--secondary-light)] py-20 lg:py-28">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center relative">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-[var(--border)] rounded-full px-4 py-1.5 text-sm font-medium text-[var(--accent)] mb-6">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275z" /></svg>
                Everything you need to launch
              </motion.div>
              <motion.h1 variants={fadeUp} className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-extrabold text-[var(--foreground)] leading-tight mb-6">
                Features built for
                <span className="relative inline-block ml-3">
                  <span className="relative z-10">launch day</span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 bg-[var(--secondary)]/30 rounded-sm -z-0" />
                </span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10">
                Every tool, widget, and integration you need to go from idea to #1 on Product Hunt. No code required.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
                <a href="/#waitlist" className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-[var(--accent)]/20">
                  Start Building Free
                </a>
                <a href="#showcase" className="bg-white hover:bg-gray-50 text-[var(--foreground)] font-semibold px-8 py-3.5 rounded-xl border border-[var(--border)] transition-colors">
                  See All Features
                </a>
              </motion.div>
            </motion.div>

            {/* Feature preview image */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-16 relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-[var(--accent)]/10 border border-[var(--border)]">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop&q=80"
                  alt="Dashboard analytics overview"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg border border-[var(--border)] px-4 py-3 hidden md:flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)]">2,400+ launches</p>
                  <p className="text-xs text-[var(--muted)]">powered by HuntReady</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Alternating Feature Showcases */}
        <section id="showcase" className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="space-y-24 lg:space-y-32">
              {featureShowcases.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={stagger}
                  className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-12 lg:gap-20`}
                >
                  {/* Image Side */}
                  <motion.div variants={fadeUp} className="flex-1 w-full">
                    <div className="relative group">
                      <div className={`absolute inset-0 rounded-3xl ${index % 2 === 0 ? "bg-[var(--accent)]/10" : "bg-[var(--secondary)]/10"} translate-x-4 translate-y-4 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-300`} />
                      <div className="relative rounded-3xl overflow-hidden shadow-xl">
                        <img
                          src={feature.image}
                          alt={feature.imageAlt}
                          className="w-full h-[300px] lg:h-[400px] object-cover"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Text Side */}
                  <motion.div variants={fadeUp} className="flex-1">
                    <span className={`inline-block text-xs font-bold tracking-widest uppercase mb-4 ${index % 2 === 0 ? "text-[var(--accent)]" : "text-[var(--secondary)]"}`}>
                      {feature.tag}
                    </span>
                    <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] mb-4 leading-tight">
                      {feature.title}
                    </h2>
                    <p className="text-[var(--muted)] text-lg mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    <ul className="space-y-3">
                      {feature.points.map((point) => (
                        <li key={point} className="flex items-start gap-3">
                          <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3"><path d="m5 12 5 5L20 7" /></svg>
                          </div>
                          <span className="text-[var(--foreground)] font-medium">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento Grid - More Features */}
        <section className="py-20 lg:py-28 bg-[var(--surface-alt)]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.h2 variants={fadeUp} className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4">
                And so much more
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-[var(--muted)] max-w-xl mx-auto">
                Every detail is thought through so you can focus on building your product.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              {bentoFeatures.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  className={`${feature.span} bg-white rounded-2xl border border-[var(--border)] p-7 hover:shadow-lg hover:shadow-[var(--accent)]/5 transition-all duration-300 group`}
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-[family-name:var(--font-display)] font-bold text-base sm:text-lg text-[var(--foreground)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--muted)] leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Comparison Banner */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="relative rounded-3xl overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&h=500&fit=crop&q=80"
                alt="Team celebrating a successful launch"
                className="w-full h-[300px] lg:h-[450px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--foreground)]/90 via-[var(--foreground)]/70 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="px-8 lg:px-14 max-w-xl">
                  <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                    Stop guessing. Start launching.
                  </h2>
                  <p className="text-white/80 text-lg mb-8">
                    Founders who use a dedicated launch page get 3.2x more upvotes on average compared to launching without one.
                  </p>
                  <a
                    href="/#waitlist"
                    className="inline-flex items-center gap-2 bg-white text-[var(--foreground)] font-semibold px-7 py-3.5 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    Get Started Free
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-28 bg-[var(--accent)]">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.h2 variants={fadeUp} className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
                Ready to crush your launch?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-white/80 text-lg mb-10">
                Join 2,400+ founders who launched with confidence.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="you@startup.com"
                  aria-label="Email address"
                  className="flex-1 px-5 py-3.5 rounded-xl text-[var(--foreground)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button className="bg-[var(--secondary)] hover:bg-orange-600 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors whitespace-nowrap">
                  Get Early Access
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
