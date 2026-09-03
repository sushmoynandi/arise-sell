"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { SERIES } from "@/data/operations";
import { cx } from "@/lib/format";

const W = 720;
const H = 200;
const PAD = { l: 8, r: 8, t: 16, b: 26 };

export default function RevenueChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [hover, setHover] = useState<number | null>(null);

  const data = SERIES.revenue;
  const max = Math.max(...data) * 1.12;
  const bw = (W - PAD.l - PAD.r) / data.length;

  return (
    <div ref={ref} className="panel p-5">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h3 className="font-display text-[15px] font-semibold tracking-tight">Revenue closed</h3>
          <p className="mt-0.5 text-[12px] text-text-3">Last 14 days · thousands BDT</p>
        </div>
        <div className="text-right">
          <p className="font-display text-[22px] font-semibold tracking-tight text-text">
            ৳{hover !== null ? data[hover] : data[data.length - 1]}k
          </p>
          <p className="font-mono text-[10.5px] text-text-3">
            {hover !== null ? `Aug ${SERIES.days[hover]}` : "today"}
          </p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 w-full"
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label="Daily revenue closed over the last 14 days"
      >
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={PAD.l}
            x2={W - PAD.r}
            y1={H - PAD.b - f * (H - PAD.t - PAD.b)}
            y2={H - PAD.b - f * (H - PAD.t - PAD.b)}
            stroke="var(--line-soft)"
          />
        ))}

        {data.map((v, i) => {
          const h = (v / max) * (H - PAD.t - PAD.b);
          const x = PAD.l + i * bw;
          const on = hover === i;
          const last = i === data.length - 1;
          return (
            <g key={i} onMouseEnter={() => setHover(i)}>
              <rect x={x} y={PAD.t} width={bw} height={H - PAD.t - PAD.b} fill="transparent" />
              <motion.rect
                x={x + bw * 0.22}
                width={bw * 0.56}
                rx={3}
                initial={{ height: 0, y: H - PAD.b }}
                animate={inView ? { height: h, y: H - PAD.b - h } : {}}
                transition={{ type: "spring", stiffness: 220, damping: 24, delay: i * 0.035 }}
                className={cx(
                  "transition-[fill] duration-150",
                  on || last ? "fill-[var(--signal)]" : "fill-[var(--surface-3)]"
                )}
              />
              <text
                x={x + bw / 2}
                y={H - 8}
                textAnchor="middle"
                fontSize="9.5"
                fontFamily="var(--font-jetbrains)"
                className={on ? "fill-[var(--text-2)]" : "fill-[var(--text-3)]"}
              >
                {SERIES.days[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
