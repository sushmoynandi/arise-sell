"use client";

import Link from "next/link";
import { PRODUCT_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-white">
              ⚡
            </div>
            <span className="font-bold text-base text-white">{PRODUCT_NAME}</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            The 24/7 AI sales and support employee for fast-scaling e-commerce businesses.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-white mb-3">Platform</h4>
          <ul className="space-y-2">
            <li><Link href="#features" className="hover:text-white">Features</Link></li>
            <li><Link href="#integrations" className="hover:text-white">Integrations</Link></li>
            <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
            <li><Link href="/dashboard" className="hover:text-white">AI Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-3">Channels</h4>
          <ul className="space-y-2">
            <li>WhatsApp Cloud API</li>
            <li>Facebook Messenger</li>
            <li>Instagram Direct</li>
            <li>Telegram Automation</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-3">Enterprise</h4>
          <ul className="space-y-2">
            <li>Custom RAG Pipeline</li>
            <li>Dedicated SLA</li>
            <li>Zero-Hallucination Guardrails</li>
            <li>support@nextproduct.ai</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 NextProduct AI. All rights reserved.</p>
        <p className="text-slate-500">Built with Next.js, Tailwind CSS and LLM Automation</p>
      </div>
    </footer>
  );
}
