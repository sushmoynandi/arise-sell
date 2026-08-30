"use client";

export default function ReviewsSection() {
  const reviews = [
    {
      quote: "NextProduct AI handles 85% of our midnight inquiries and orders on WhatsApp. We gained an extra $4,200 in monthly revenue without hiring a night-shift rep.",
      author: "Tariq Ahmed",
      role: "Founder, ElectroHub Store",
      avatar: "👨‍💼",
      rating: 5,
    },
    {
      quote: "Our Messenger conversion rate doubled. Customers get replies in seconds with exact size recommendations, and orders flow right into Shopify.",
      author: "Sabrina Rahman",
      role: "Operations Lead, UrbanBoutique",
      avatar: "👩‍💼",
      rating: 5,
    },
    {
      quote: "The knowledge base accuracy is incredible. It explains our return policy and delivery times perfectly without making mistakes.",
      author: "Rashed Khan",
      role: "CEO, Apex Retail",
      avatar: "👨‍💻",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-[#f0f4f8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/50 bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-950">
            Client Success
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-950 sm:text-4xl">
            Loved by fast-scaling business owners
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex text-amber-400 mb-4 text-sm">
                  {"★".repeat(r.rating)}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic mb-6">
                  &ldquo;{r.quote}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                  {r.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{r.author}</h4>
                  <p className="text-[11px] text-slate-500">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
