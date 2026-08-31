"use client";

import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { Wordmark } from "@/components/ui/primitives";
import { IconCheck, IconWhatsApp } from "@/components/ui/icons";
import { useLang } from "@/lib/i18n";

const COLUMNS = [
  {
    titleEn: "Product",
    titleBn: "প্রোডাক্ট",
    links: [
      { labelEn: "Features", labelBn: "ফিচারসমূহ", href: "/#features" },
      { labelEn: "How it works", labelBn: "কীভাবে কাজ করে", href: "/#how-it-works" },
      { labelEn: "Pricing", labelBn: "মূল্য ও প্ল্যান", href: "/#pricing" },
      { labelEn: "Live Console", labelBn: "লাইভ ড্যাশবোর্ড", href: "/console" },
    ],
  },
  {
    titleEn: "Channels",
    titleBn: "চ্যানেল",
    links: [
      { labelEn: "WhatsApp Business", labelBn: "হোয়াটসঅ্যাপ বিজনেস", href: "/#channels" },
      { labelEn: "Facebook Messenger", labelBn: "ফেসবুক মেসেঞ্জার", href: "/#channels" },
      { labelEn: "Instagram Direct", labelBn: "ইনস্টাগ্রাম ডিরেক্ট", href: "/#channels" },
      { labelEn: "Website Live Chat", labelBn: "ওয়েবসাইট চ্যাট উইজেট", href: "/#channels" },
    ],
  },
  {
    titleEn: "Company",
    titleBn: "কোম্পানি",
    links: [
      { labelEn: "Our Story", labelBn: "আমাদের গল্প", href: "/#story" },
      { labelEn: "Common FAQs", labelBn: "সাধারণ প্রশ্নোত্তর", href: "/#faq" },
      { labelEn: "Contact Us", labelBn: "যোগাযোগ", href: "/contact" },
    ],
  },
];

export default function SiteFooter() {
  const { t } = useLang();

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-[1280px] px-5 pb-10 pt-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] lg:gap-12">
          {/* brand + contact */}
          <div>
            <Wordmark />
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-text-2">
              {t(
                "The 24-hour salesperson for Bangladeshi shops selling on WhatsApp, Messenger and Instagram.",
                "হোয়াটসঅ্যাপ, মেসেঞ্জার ও ইনস্টাগ্রামে বিক্রয়কারী বাংলাদেশি শপগুলোর সার্বক্ষণিক এআই বিক্রয়কর্মী।"
              )}
            </p>

            <div className="mt-6 space-y-2.5">
              <a
                href="tel:+8801710000000"
                className="flex items-center gap-2.5 text-[14px] text-text-2 transition-colors hover:text-signal"
              >
                <span className="grid size-8 place-items-center rounded-xl bg-[#e6f4ee] text-signal">
                  <IconWhatsApp width={15} height={15} />
                </span>
                017 1000 0000
              </a>
              <a
                href={`mailto:${BRAND.supportEmail}`}
                className="block text-[14px] text-text-2 transition-colors hover:text-signal"
              >
                {BRAND.supportEmail}
              </a>
              <p className="text-[13.5px] text-text-3">
                {t("Banani, Dhaka 1213, Bangladesh", "বনানী, ঢাকা ১২১৩, বাংলাদেশ")}
              </p>
            </div>

            <p className="mt-6 flex items-center gap-2 text-[12.5px] text-text-3">
              <IconCheck width={13} height={13} className="text-signal" />
              {t("Verified Meta Tech Provider", "ভেরিফাইড মেটা টেক পার্টনার")}
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.titleEn}>
              <h4 className="text-[14px] font-semibold text-text">
                {t(col.titleEn, col.titleBn)}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.labelEn}>
                    <Link
                      href={l.href}
                      className="text-[13.5px] text-text-2 transition-colors hover:text-signal"
                    >
                      {t(l.labelEn, l.labelBn)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-[13px] text-text-3 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {BRAND.nameFull} — {t("All rights reserved.", "সর্বস্বত্ব সংরক্ষিত।")}
          </p>
          <p className="flex flex-wrap gap-x-5 gap-y-1">
            <Link href="/docs" className="transition-colors hover:text-signal">
              {t("Privacy", "প্রাইভেসি")}
            </Link>
            <Link href="/docs" className="transition-colors hover:text-signal">
              {t("Terms", "শর্তাবলী")}
            </Link>
            <span>{t("Prices in BDT, VAT included", "সকল মূল্য বাংলাদেশি টাকায় (ভ্যাট অন্তর্ভুক্ত)")}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
