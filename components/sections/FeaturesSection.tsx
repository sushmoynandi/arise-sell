"use client";

export default function FeaturesSection() {
  const coreFeatures = [
    {
      icon: "💬",
      title: "Omnichannel Messaging",
      description: "One unified AI agent handling WhatsApp Cloud API, Facebook Messenger, Instagram DMs, and Web Live Chat simultaneously.",
    },
    {
      icon: "📦",
      title: "Automated Order Taking",
      description: "Understands product variations, sizes, colors, checks live inventory stock, and automatically confirms orders into your CRM or Shopify.",
    },
    {
      icon: "⚡",
      title: "Sub-Second Instant Replies",
      description: "No customer ever waits. Answer inquiries in under 850ms, capture late-night buyers, and prevent drop-offs.",
    },
    {
      icon: "🧠",
      title: "Zero-Hallucination Knowledge RAG",
      description: "Ingest your store policies, warranty rules, and pricing docs. The agent strictly answers based on your verified knowledge base.",
    },
    {
      icon: "📅",
      title: "Autonomous Appointment Booking",
      description: "Qualifies leads and syncs directly with Google Calendar and Calendly without back-and-forth messaging.",
    },
    {
      icon: "🚨",
      title: "Human Takeover and Escalation",
      description: "Sentiment analysis detects urgent or high-ticket VIP inquiries and instantly alerts your team via Slack and SMS.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-[#f0f4f8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/50 bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-950">
            Features and Capabilities
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-950 sm:text-4xl">
            Everything your business needs to operate on autopilot
          </h2>
          <p className="mt-4 text-base text-slate-600">
            From instant customer support to live order fulfillment, NextProduct AI does the heavy lifting 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feat.description}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-slate-900 group-hover:text-sky-600">
                Learn more →
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
