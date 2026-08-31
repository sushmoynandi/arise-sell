/** Formatting helpers shared by marketing + console. */

export const bdt = (n: number, opts: { compact?: boolean } = {}) => {
  if (opts.compact && n >= 100000) return `৳${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
  if (opts.compact && n >= 1000) return `৳${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `৳${n.toLocaleString("en-IN")}`;
};

export const compact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${n}`;
};

export const pct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;

/** "01712345678" -> "017 1234 5678" */
export const phone = (v: string) => v.replace(/^(\d{3})(\d{4})(\d{4})$/, "$1 $2 $3");

/** Bangladesh mobile MSISDN rule used across the product. */
export const BD_PHONE = /^01[3-9]\d{8}$/;

export const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

export const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
