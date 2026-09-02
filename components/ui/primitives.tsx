import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import { CHANNEL_ICON } from "./icons";
import type { Channel } from "@/data/types";

import Image from "next/image";

/* --------------------------------------------------------------- Wordmark */

export function Wordmark({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center p-0 m-0 leading-none select-none",
        className,
      )}
    >
      <Image
        src="/logo.png"
        alt="AriseSell"
        width={180}
        height={60}
        className={cx(
          "block p-0 m-0 object-contain transition-transform duration-200 hover:scale-[1.02]",
          compact ? "h-[26px] w-auto" : "h-8 sm:h-[34px] w-auto max-w-38",
        )}
        priority
        unoptimized
      />
    </span>
  );
}

/* ----------------------------------------------------------------- Button */

type BtnProps = {
  children: ReactNode;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  variant?: "signal" | "ghost" | "outline" | "quiet";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-[background-color,border-color,color,box-shadow] duration-200 whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

const BTN_VARIANT = {
  signal:
    "bg-signal text-signal-ink hover:bg-(--signal-deep) shadow-[0_1px_2px_rgba(15,20,25,0.08)]",
  outline:
    "border border-line bg-surface text-text shadow-[0_1px_2px_rgba(15,20,25,0.04)] hover:border-(--signal-line) hover:bg-surface-2",
  ghost: "text-text-2 hover:text-text hover:bg-surface-2",
  quiet: "bg-surface-2 text-text-2 hover:bg-surface-3 hover:text-text",
};

const BTN_SIZE = {
  sm: "h-8 px-3 text-[12.5px]",
  md: "h-10 px-4 text-[13.5px]",
  lg: "h-12 px-6 text-[14.5px]",
};

export function Button({
  children,
  href,
  target,
  rel,
  onClick,
  variant = "signal",
  size = "md",
  className,
  type = "button",
  disabled = false,
}: BtnProps) {
  const cls = cx(BTN_BASE, BTN_VARIANT[variant], BTN_SIZE[size], className);
  if (href)
    return (
      <Link href={href} target={target} rel={rel} className={cls}>
        {children}
      </Link>
    );
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ Badge */

const TONE = {
  signal: "bg-signal-wash text-signal border-(--signal-line)",
  mint: "bg-mint/10 text-mint border-mint/25",
  amber: "bg-amber/10 text-amber border-amber/25",
  coral: "bg-coral/10 text-coral border-coral/25",
  iris: "bg-iris/10 text-iris border-iris/25",
  azure: "bg-azure/10 text-azure border-azure/25",
  neutral: "bg-surface-2 text-text-2 border-line",
} as const;

export type Tone = keyof typeof TONE;

export function Badge({
  children,
  tone = "neutral",
  className,
  dot = false,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.75 text-[10.5px] font-semibold leading-none tracking-[0.02em]",
        TONE[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------- Eyebrow/Kbd */

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-3",
        className,
      )}
    >
      <span className="h-px w-6 bg-line" />
      {children}
    </span>
  );
}

export function LiveDot({
  tone = "mint",
}: {
  tone?: "mint" | "signal" | "amber";
}) {
  const c = { mint: "text-mint", signal: "text-signal", amber: "text-amber" }[
    tone
  ];
  return (
    <span className={cx("relative grid size-2 place-items-center", c)}>
      <span className="anim-ring absolute inset-0 rounded-full opacity-40" />
      <span className="size-2 rounded-full bg-current" />
    </span>
  );
}

/* ------------------------------------------------------------------ Panel */

export function Panel({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div className={cx("panel", interactive && "edge-lift", className)}>
      {children}
    </div>
  );
}

export function PanelHead({
  title,
  sub,
  right,
  className,
}: {
  title: ReactNode;
  sub?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex items-start justify-between gap-4 border-b border-line px-5 py-4",
        className,
      )}
    >
      <div className="min-w-0">
        <h3 className="font-display text-[15px] font-semibold tracking-[-0.02em] text-text">
          {title}
        </h3>
        {sub && (
          <p className="mt-0.5 text-[12.5px] leading-snug text-text-3">{sub}</p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------- Channel */

export function ChannelChip({
  channel,
  label,
}: {
  channel: Channel;
  label?: string;
}) {
  const Icon = CHANNEL_ICON[channel];
  const tint: Record<Channel, string> = {
    whatsapp: "text-mint",
    messenger: "text-azure",
    instagram: "text-iris",
    web: "text-signal",
    telegram: "text-text-3",
  };
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] text-text-3">
      <Icon width={13} height={13} className={tint[channel]} />
      {label ?? channel}
    </span>
  );
}

/* --------------------------------------------------------------- Sparkline */

export function Sparkline({
  data,
  className,
  stroke = "var(--signal)",
  fill = true,
  height = 36,
}: {
  data: number[];
  className?: string;
  stroke?: string;
  fill?: boolean;
  height?: number;
}) {
  const w = 100;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((v - min) / span) * (height - 4) - 2;
    return [x, y] as const;
  });
  const d = pts
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
  const id = `sg-${stroke.replace(/[^a-z]/gi, "")}-${data.length}-${Math.round(max)}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
      className={cx("w-full", className)}
      style={{ height }}
      aria-hidden
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`${d} L${w},${height} L0,${height} Z`}
            fill={`url(#${id})`}
          />
        </>
      )}
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* -------------------------------------------------------------- Meter bar */

export function Meter({
  value,
  max,
  tone = "signal",
  className,
}: {
  value: number;
  max: number;
  tone?: "signal" | "mint" | "amber" | "coral";
  className?: string;
}) {
  const pctVal = Math.min(100, (value / max) * 100);
  const bg = {
    signal: "bg-signal",
    mint: "bg-mint",
    amber: "bg-amber",
    coral: "bg-coral",
  }[tone];
  return (
    <div
      className={cx(
        "h-1.5 w-full overflow-hidden rounded-full bg-surface-3",
        className,
      )}
    >
      <div
        className={cx(
          "h-full rounded-full transition-[width] duration-700",
          bg,
        )}
        style={{ width: `${pctVal}%` }}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- Avatar */

export function Avatar({
  name,
  hue = 82,
  size = 32,
}: {
  name: string;
  hue?: number;
  size?: number;
}) {
  const ini = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-medium"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `hsl(${hue} 62% 95%)`,
        color: `hsl(${hue} 58% 28%)`,
        boxShadow: `inset 0 0 0 1px hsl(${hue} 45% 86%)`,
      }}
    >
      {ini}
    </span>
  );
}

/* ------------------------------------------------------------------ Delta */

export function Delta({
  value,
  suffix = "%",
}: {
  value: number;
  suffix?: string;
}) {
  const up = value >= 0;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 text-[12px] font-medium",
        up ? "text-mint" : "text-coral",
      )}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
        <path
          d={up ? "M5 2.2 8.4 7.4H1.6Z" : "M5 7.8 1.6 2.6h6.8Z"}
          fill="currentColor"
        />
      </svg>
      {Math.abs(value).toFixed(1)}
      {suffix}
    </span>
  );
}
