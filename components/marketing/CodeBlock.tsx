"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconCheck } from "@/components/ui/icons";
import { SPRING_POP } from "@/components/motion";

/** Minimal JSON/HTTP tinting — no highlighter dependency. */
function tint(line: string) {
  const parts: Array<{ t: string; c: string }> = [];
  const re = /("(?:[^"\\]|\\.)*"\s*:)|("(?:[^"\\]|\\.)*")|(\b(?:true|false|null)\b)|(\b\d+\.?\d*\b)|(^\s*(?:GET|POST|PUT|PATCH|DELETE)\b)|(\/\/.*$)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) parts.push({ t: line.slice(last, m.index), c: "text-text-2" });
    if (m[1]) parts.push({ t: m[1], c: "text-azure" });
    else if (m[2]) parts.push({ t: m[2], c: "text-signal" });
    else if (m[3]) parts.push({ t: m[3], c: "text-iris" });
    else if (m[4]) parts.push({ t: m[4], c: "text-amber" });
    else if (m[5]) parts.push({ t: m[5], c: "text-mint font-medium" });
    else if (m[6]) parts.push({ t: m[6], c: "text-text-3 italic" });
    last = m.index + m[0].length;
  }
  if (last < line.length) parts.push({ t: line.slice(last), c: "text-text-2" });
  return parts;
}

export default function CodeBlock({
  code,
  label,
  className,
}: {
  code: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const lines = code.replace(/\n$/, "").split("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className={`panel overflow-hidden ${className ?? ""}`}>
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-text-3">
          {label ?? "example"}
        </span>
        <button
          onClick={copy}
          className="relative rounded-md px-2 py-1 font-mono text-[10.5px] text-text-3 transition-colors hover:bg-surface-2 hover:text-text-2"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="ok"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={SPRING_POP}
                className="flex items-center gap-1 text-signal"
              >
                <IconCheck width={10} height={10} />
                copied
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={SPRING_POP}
              >
                copy
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      <pre className="overflow-x-auto bg-canvas px-4 py-4 font-mono text-[12px] leading-[1.65]">
        <code>
          {lines.map((ln, i) => (
            <div key={i} className="flex">
              <span className="w-7 shrink-0 select-none text-right text-text-3/70">{i + 1}</span>
              <span className="pl-4">
                {tint(ln).map((p, j) => (
                  <span key={j} className={p.c}>
                    {p.t}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
