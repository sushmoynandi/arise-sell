"use client";

import { Badge, Panel, Eyebrow } from "@/components/ui/primitives";
import {
  IconWhatsApp,
  IconMessenger,
  IconInstagram,
  IconWidget,
} from "@/components/ui/icons";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { useLang } from "@/lib/i18n";

const CHANNELS = [
  {
    icon: IconWhatsApp,
    name: "WhatsApp Business",
    nameBn: "হোয়াটসঅ্যাপ বিজনেস",
    tint: "text-mint",
    bodyEn: "Official Cloud API through Meta. Instant replies, photo product matching, address taking, and automated courier consignment creation.",
    bodyBn: "মেটার অফিশিয়াল ক্লাউড এপিআই। দ্রুত উত্তর, ছবি দেখে প্রোডাক্ট চিনতে পারা, ঠিকানা সংগ্রহ এবং স্বয়ংক্রিয় কুরিয়ার বুকিং।",
    facts: ["Meta Official Cloud API", "Zero Ban Risk", "Instant Catalog Sync"],
  },
  {
    icon: IconMessenger,
    name: "Facebook Messenger",
    nameBn: "ফেসবুক মেসেঞ্জার",
    tint: "text-azure",
    bodyEn: "Handles incoming DMs and comments on posts and live streams. Auto-replies publicly and sends product checkout directly to inbox.",
    bodyBn: "ইনবক্স মেসেজ এবং ফেসবুক পোস্টের কমেন্টের স্বয়ংক্রিয় উত্তর। কমেন্টকারীকে সরাসরি ইনবক্সে প্রোডাক্ট লিংক পাঠানো।",
    facts: ["Auto Comment → DM", "Live Stream Orders", "Multi-Page Support"],
  },
  {
    icon: IconInstagram,
    name: "Instagram Direct",
    nameBn: "ইনস্টাগ্রাম ডিরেক্ট",
    tint: "text-iris",
    bodyEn: "Direct messages, story mentions, and reels comment capture with seamless unified inventory matching.",
    bodyBn: "ডিরেক্ট মেসেজ, স্টোরি রিপ্লাই এবং রিলসের কমেন্ট থেকে সরাসরি অর্ডার গ্রহণ ও স্টক ম্যানেজমেন্ট।",
    facts: ["Story Mentions", "Reels & Post Comments", "Shared Customer Cart"],
  },
  {
    icon: IconWidget,
    name: "Website Live Widget",
    nameBn: "ওয়েবসাইট লাইভ চ্যাট",
    tint: "text-signal",
    bodyEn: "One script tag for your custom website, Shopify, or WooCommerce store with identical Bangla AI intelligence.",
    bodyBn: "আপনার ওয়েবসাইট, শপিফাই বা ওয়ার্ডপ্রেসের জন্য এক লাইনের কোড। একই স্মার্ট এআই দিয়ে ওয়েবসাইটেও বিক্রি করুন।",
    facts: ["One-Line Embed", "WooCommerce / Shopify", "Fast & Lightweight"],
  },
];

export default function ChannelsSection() {
  const { t } = useLang();

  return (
    <section id="channels" className="relative border-t border-line py-20 lg:py-28 bg-canvas">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>{t("Omnichannel", "সকল প্ল্যাটফর্মে")}</Eyebrow>
            <h2 className="mt-3 text-balance font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
              {t("Four channels your buyers love. One single inbox for you.", "কাস্টমার যেখান থেকেই নক দিক, সব অর্ডার এক জায়গায়।")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-text-2">
              {t(
                "WhatsApp, Messenger, Instagram, or Web — your customers get instant replies in Bangla 24/7 without switching tools.",
                "হোয়াটসঅ্যাপ, মেসেঞ্জার, ইনস্টাগ্রাম বা ওয়েবসাইট — আপনার কাস্টমার সব জায়গায় পাবেন সার্বক্ষণিক সঠিক উত্তর।"
              )}
            </p>
          </div>
        </Reveal>

        <Stagger className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {CHANNELS.map((c) => (
            <StaggerItem key={c.name}>
              <Panel interactive className="h-full p-6 sm:p-7">
                <div className="flex items-center gap-3.5">
                  <span className="grid size-11 place-items-center rounded-2xl bg-surface-2">
                    <c.icon width={22} height={22} className={c.tint} />
                  </span>
                  <div>
                    <h3 className="font-display text-[19px] font-semibold tracking-tight text-text">
                      {t(c.name, c.nameBn)}
                    </h3>
                  </div>
                </div>

                <p className="mt-4 text-[14.5px] leading-relaxed text-text-2">
                  {t(c.bodyEn, c.bodyBn)}
                </p>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {c.facts.map((f) => (
                    <li key={f}>
                      <Badge tone="neutral">{f}</Badge>
                    </li>
                  ))}
                </ul>
              </Panel>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
