"use client";

export function PaymentGatewaysBar() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Gateway 1: bKash */}
      <div className="rounded-2xl border border-line bg-white p-4.5 shadow-2xs flex items-center justify-between hover:border-line-2 transition-colors">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-pink-500/10 border border-pink-200 grid place-items-center text-pink-700 font-bold font-mono text-[13px] shrink-0">
            bK
          </div>
          <div>
            <p className="font-bold text-text text-[14px]">
              bKash Tokenized Direct
            </p>
            <p className="text-[11.5px] text-text-3 font-mono">
              68% of Volume · Instant Auto-Debit
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-signal/8 px-2.5 py-0.5 text-[11px] font-bold text-signal font-mono">
          <span className="size-1.5 rounded-full bg-signal" />
          LIVE
        </span>
      </div>

      {/* Gateway 2: Nagad */}
      <div className="rounded-2xl border border-line bg-white p-4.5 shadow-2xs flex items-center justify-between hover:border-line-2 transition-colors">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-orange-500/10 border border-orange-200 grid place-items-center text-orange-700 font-bold font-mono text-[13px] shrink-0">
            NG
          </div>
          <div>
            <p className="font-bold text-text text-[14px]">
              Nagad Direct Gateway
            </p>
            <p className="text-[11.5px] text-text-3 font-mono">
              22% of Volume · Webhook Instant
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-signal/8 px-2.5 py-0.5 text-[11px] font-bold text-signal font-mono">
          <span className="size-1.5 rounded-full bg-signal" />
          LIVE
        </span>
      </div>

      {/* Gateway 3: SSLCommerz */}
      <div className="rounded-2xl border border-line bg-white p-4.5 shadow-2xs flex items-center justify-between hover:border-line-2 transition-colors">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-200 grid place-items-center text-blue-700 font-bold font-mono text-[13px] shrink-0">
            SSL
          </div>
          <div>
            <p className="font-bold text-text text-[14px]">
              SSLCommerz (Cards)
            </p>
            <p className="text-[11.5px] text-text-3 font-mono">
              10% of Volume · Visa / Mastercard
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-signal/8 px-2.5 py-0.5 text-[11px] font-bold text-signal font-mono">
          <span className="size-1.5 rounded-full bg-signal" />
          LIVE
        </span>
      </div>
    </div>
  );
}
