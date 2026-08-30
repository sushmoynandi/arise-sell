"use client";

export default function StatsSection() {
  const logos = [
    "Apex Retail", "ElectroHub", "FashionCraft", "UrbanBoutique", "ChronoTime", "Zenith Mart", "Global Prints", "PrimeDelivery"
  ];

  return (
    <section className="bg-white border-y border-slate-200 py-10 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 mb-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/50 bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-950">
          <span className="size-1.5 rounded-full bg-sky-500"></span>
          Trusted by 500+ Fast-Growing Brands
        </span>
        <h3 className="mt-3 text-lg font-bold text-slate-900">
          Automating 24/7 sales and support across leading businesses
        </h3>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 justify-center flex-wrap px-4">
        {logos.map((logo, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 bg-[#f0f4f8] border border-slate-200 px-5 py-2.5 rounded-2xl shadow-sm text-sm font-bold text-slate-800"
          >
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            {logo}
          </div>
        ))}
      </div>
    </section>
  );
}
