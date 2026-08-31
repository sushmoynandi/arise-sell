"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Eyebrow } from "@/components/ui/primitives";
import { Counter, Reveal } from "@/components/motion";

import { useLang } from "@/lib/i18n";

/** Conversion by first-reply latency — the curve every F-commerce page lives on. */
const CURVE = [
  { t: "0–1 min", tBn: "০–১ মি.", v: 68 },
  { t: "5 min", tBn: "৫ মি.", v: 51 },
  { t: "15 min", tBn: "১৫ মি.", v: 34 },
  { t: "1 hr", tBn: "১ ঘণ্টা", v: 19 },
  { t: "4 hr", tBn: "৪ ঘণ্টা", v: 11 },
  { t: "Next day", tBn: "পরের দিন", v: 4 },
];

const W = 560;
const H = 220;

export default function ReplyDecay() {
  const { t } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  const pts = CURVE.map((d, i) => {
    const x = (i / (CURVE.length - 1)) * (W - 40) + 20;
    const y = H - 30 - (d.v / 70) * (H - 60);
    return { ...d, x, y };
  });

  // smooth cubic path
  const path = pts.reduce((acc, p, i, arr) => {
    if (!i) return `M${p.x},${p.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
  }, "");

  return (
    <section className="relative border-t border-line py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <Eyebrow>
                {t("Why speed is the whole product", "গতিই কেন আসল শক্তি")}
              </Eyebrow>
              <h2 className="mt-5 text-balance font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-semibold leading-[1.08] tracking-[-0.025em]">
                {t(
                  "A customer who waits an hour",
                  "যে কাস্টমার ১ ঘণ্টা অপেক্ষা করে",
                )}
                <span className="text-text-3">
                  {" "}
                  {t(
                    "has already bought from someone else.",
                    "সে অন্য কারো কাছ থেকে কিনে ফেলে।",
                  )}
                </span>
              </h2>
              <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-text-2">
                {t(
                  "On a Facebook page, intent has a half-life measured in minutes. The person asking “দাম কত?” at 11pm is asking four other pages the same thing. Whoever answers first usually wins, and it is almost never the page that answers at 10am.",
                  "ফেসবুক পেজে ক্রেতার আগ্রহ কয়েক মিনিটের মধ্যেই হারিয়ে যায়। রাত ১১টায় যে “দাম কত?” লিখেছে, সে আরও ৪টি পেজকে একই প্রশ্ন করেছে। যে আগে উত্তর দেয় সাধারণত সেই অর্ডার পায় — পরদিন সকাল ১০টায় উত্তর দেওয়া পেজ নয়।",
                )}
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="mt-9 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
                <div className="bg-surface px-5 py-4">
                  <p className="font-mono text-[10.5px] uppercase tracking-wider text-text-3">
                    {t("Typical page admin", "সাধারণ পেজ অ্যাডমিন")}
                  </p>
                  <p className="mt-2 font-display text-[28px] font-semibold tracking-tight text-coral">
                    <Counter to={47} suffix={t(" min", " মিনিট")} />
                  </p>
                  <p className="mt-1 text-[12px] text-text-3">
                    {t("median first reply", "গড় উত্তরের সময়")}
                  </p>
                </div>
                <div className="bg-surface px-5 py-4">
                  <p className="font-mono text-[10.5px] uppercase tracking-wider text-text-3">
                    NextProduct AI
                  </p>
                  <p className="mt-2 font-display text-[28px] font-semibold tracking-tight text-signal">
                    <Counter
                      to={3.8}
                      decimals={1}
                      suffix={t(" sec", " সেকেন্ড")}
                    />
                  </p>
                  <p className="mt-1 text-[12px] text-text-3">
                    {t("median first reply", "গড় উত্তরের সময়")}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* chart */}
          <Reveal delay={0.08}>
            <div ref={ref} className="panel p-6">
              <div className="mb-5 flex items-baseline justify-between">
                <p className="text-[13px] font-medium text-text">
                  {t(
                    "Order rate by first-reply time",
                    "উত্তরের গতির সাথে অর্ডারের হার",
                  )}
                </p>
                <p className="font-mono text-[10.5px] text-text-3">
                  n = 41,208 threads
                </p>
              </div>

              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="w-full"
                role="img"
                aria-label="Conversion decays sharply as reply time increases"
              >
                <defs>
                  <linearGradient id="decayFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--signal)"
                      stopOpacity="0.24"
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--signal)"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                {[0, 17.5, 35, 52.5, 70].map((g) => {
                  const y = H - 30 - (g / 70) * (H - 60);
                  return (
                    <g key={g}>
                      <line
                        x1="20"
                        y1={y}
                        x2={W - 20}
                        y2={y}
                        stroke="var(--line-soft)"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y={y + 3.5}
                        fill="var(--text-3)"
                        fontSize="9"
                        fontFamily="var(--font-jetbrains)"
                      >
                        {g}%
                      </text>
                    </g>
                  );
                })}

                <motion.path
                  d={`${path} L${pts[pts.length - 1].x},${H - 30} L${pts[0].x},${H - 30} Z`}
                  fill="url(#decayFill)"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.7 }}
                />
                <motion.path
                  d={path}
                  fill="none"
                  stroke="var(--signal)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : {}}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                />

                {pts.map((p, i) => (
                  <motion.g
                    key={p.t}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 20,
                      delay: 0.5 + i * 0.11,
                    }}
                    style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4.5"
                      fill="var(--surface)"
                      stroke="var(--signal)"
                      strokeWidth="2"
                    />
                    <text
                      x={p.x}
                      y={H - 12}
                      textAnchor="middle"
                      fill="var(--text-3)"
                      fontSize="9.5"
                      fontFamily="var(--font-jetbrains)"
                    >
                      {t(p.t, p.tBn)}
                    </text>
                  </motion.g>
                ))}

                {/* NextProduct marker at the far left */}
                <motion.g
                  initial={{ opacity: 0, y: -8 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    delay: 1.7,
                    type: "spring",
                    stiffness: 300,
                    damping: 22,
                  }}
                >
                  <rect
                    x={pts[0].x - 16}
                    y={pts[0].y - 32}
                    width="78"
                    height="20"
                    rx="5"
                    fill="var(--signal)"
                  />
                  <text
                    x={pts[0].x + 23}
                    y={pts[0].y - 18}
                    textAnchor="middle"
                    fill="var(--signal-ink)"
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="var(--font-inter-tight)"
                  >
                    {t("you are here", "আপনার অবস্থান")}
                  </text>
                </motion.g>
              </svg>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
