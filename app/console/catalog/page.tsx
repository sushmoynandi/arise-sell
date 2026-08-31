"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/console/PageHeader";
import { Badge, Button, Meter, Panel, PanelHead } from "@/components/ui/primitives";
import { IconCheck, IconEye, IconWarn } from "@/components/ui/icons";
import { SPRING, Stagger, StaggerItem } from "@/components/motion";
import { CATEGORIES, FEED_SYNCS, PRODUCTS } from "@/data/catalog";
import { bdt, cx } from "@/lib/format";

export default function CatalogPage() {
  const [cat, setCat] = useState<string>("All");
  const list = cat === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === cat);

  const indexed = PRODUCTS.filter((p) => p.visionIndexed).length;
  const oos = PRODUCTS.flatMap((p) => p.variants).filter((v) => v.stock === 0).length;

  return (
    <>
      <PageHeader
        title="Catalog"
        sub="What the agent is allowed to sell — and the photo index that lets a screenshot find it."
        actions={
          <>
            <Badge tone={indexed === PRODUCTS.length ? "mint" : "amber"} dot>
              {indexed}/{PRODUCTS.length} vision-indexed
            </Badge>
            <Button size="sm" variant="outline">
              Sync feed now
            </Button>
          </>
        }
      />

      <div className="space-y-5 p-5 lg:p-8">
        {/* summary strip */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Live SKUs", value: PRODUCTS.flatMap((p) => p.variants).length, note: "across 6 products" },
            { label: "Out of stock", value: oos, note: "hidden from the agent automatically" },
            { label: "Sold this week", value: PRODUCTS.reduce((a, p) => a + p.soldThisWeek, 0), note: "units across all channels" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: i * 0.06 }}
              className="panel p-5"
            >
              <p className="text-[12.5px] text-text-3">{s.label}</p>
              <p className="mt-1.5 font-display text-[26px] font-semibold tracking-tight">{s.value}</p>
              <p className="mt-0.5 text-[11.5px] text-text-3">{s.note}</p>
            </motion.div>
          ))}
        </div>

        {/* filters */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cx(
                "relative rounded-lg px-3 py-1.5 text-[12.5px] transition-colors",
                cat === c ? "text-text" : "text-text-3 hover:text-text-2"
              )}
            >
              {cat === c && (
                <motion.span
                  layoutId="cat-pill"
                  transition={SPRING}
                  className="absolute inset-0 -z-10 rounded-lg border border-[color:var(--signal-line)] bg-signal-wash"
                />
              )}
              {c}
            </button>
          ))}
        </div>

        {/* product grid */}
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => {
            const stock = p.variants.reduce((a, v) => a + v.stock, 0);
            return (
              <StaggerItem key={p.id}>
                <Panel interactive className="h-full overflow-hidden">
                  <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 hover:scale-[1.04]"
                    />
                    <div className="absolute left-2.5 top-2.5 flex gap-1.5">
                      {p.visionIndexed ? (
                        <span className="flex items-center gap-1 rounded-md bg-black/65 px-2 py-1 font-mono text-[9.5px] text-iris backdrop-blur">
                          <IconEye width={10} height={10} />
                          INDEXED
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-md bg-black/65 px-2 py-1 font-mono text-[9.5px] text-amber backdrop-blur">
                          <IconWarn width={10} height={10} />
                          PENDING
                        </span>
                      )}
                    </div>
                    {p.compareAt && (
                      <span className="absolute right-2.5 top-2.5 rounded-md bg-signal px-2 py-1 font-mono text-[9.5px] font-semibold text-signal-ink">
                        −{Math.round((1 - p.price / p.compareAt) * 100)}%
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-[14px] font-medium text-text">{p.name}</h3>
                        <p className="truncate font-[family-name:var(--font-hind)] text-[12px] text-text-3">
                          {p.nameBn}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] text-text-3">{p.id}</span>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-display text-[17px] font-semibold tracking-tight text-text">
                        {bdt(p.price)}
                      </span>
                      {p.compareAt && (
                        <span className="font-mono text-[11px] text-text-3 line-through">
                          {bdt(p.compareAt)}
                        </span>
                      )}
                    </div>

                    <div className="mt-3.5 space-y-1.5">
                      {p.variants.map((v) => (
                        <div key={v.sku} className="flex items-center gap-2.5">
                          <span className="w-20 shrink-0 truncate font-mono text-[10.5px] text-text-3">
                            {v.sku}
                          </span>
                          <span className="flex-1 truncate text-[11.5px] text-text-2">{v.label}</span>
                          <span
                            className={cx(
                              "shrink-0 font-mono text-[10.5px]",
                              v.stock === 0 ? "text-coral" : v.stock < 8 ? "text-amber" : "text-text-3"
                            )}
                          >
                            {v.stock === 0 ? "out" : `${v.stock} left`}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 border-t border-line-soft pt-3">
                      <div className="flex items-center justify-between text-[11px] text-text-3">
                        <span>Stock depth</span>
                        <span className="font-mono">{stock} units</span>
                      </div>
                      <Meter value={stock} max={80} tone={stock < 20 ? "amber" : "signal"} className="mt-2" />
                    </div>
                  </div>
                </Panel>
              </StaggerItem>
            );
          })}
        </Stagger>

        {/* feed sync observability */}
        <Panel>
          <PanelHead
            title="Feed sync history"
            sub="Every pull from your store, with what changed and what broke. A silent feed failure looks exactly like the agent lying about stock."
            right={<Badge tone="neutral">every 6h + manual</Badge>}
          />
          <ul className="divide-y divide-[color:var(--line-soft)]">
            {FEED_SYNCS.map((s, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING, delay: i * 0.05 }}
                className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3.5"
              >
                <span
                  className={cx(
                    "grid size-6 shrink-0 place-items-center rounded-full",
                    s.ok ? "bg-mint/12 text-mint" : "bg-coral/12 text-coral"
                  )}
                >
                  {s.ok ? <IconCheck width={12} height={12} /> : <IconWarn width={12} height={12} />}
                </span>
                <span className="w-32 shrink-0 font-mono text-[11.5px] text-text-2">{s.at}</span>

                {s.ok ? (
                  <div className="flex flex-1 flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-text-3">
                    <span>{s.found} found</span>
                    <span className="text-mint">+{s.created} new</span>
                    <span className="text-azure">{s.updated} updated</span>
                    <span className="text-amber">{s.oos} → out of stock</span>
                  </div>
                ) : (
                  <p className="flex-1 text-[12px] text-coral">{s.error}</p>
                )}

                <span className="shrink-0 font-mono text-[10.5px] text-text-3">
                  {(s.ms / 1000).toFixed(1)}s
                </span>
              </motion.li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
