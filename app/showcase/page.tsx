"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const caseStudies = [
  {
    name: "DesignSync",
    tagline: "Real-time design collaboration for remote teams",
    result: "#2 Product of the Day",
    upvotes: "1,247",
    signups: "3,400",
    referralRate: "2.8x",
    quote: "HuntReady's referral waitlist was the single biggest driver. We had 800 people on launch day before we even woke up.",
    founder: "Sarah Chen",
    founderRole: "CEO & Co-founder",
    founderImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=500&fit=crop&q=80",
    color: "from-violet-500 to-purple-600",
    tag: "Design Tools",
  },
  {
    name: "MetricFlow",
    tagline: "Analytics that actually make sense",
    result: "#1 Product of the Day",
    upvotes: "2,103",
    signups: "5,200",
    referralRate: "3.1x",
    quote: "We went from 0 to 5,200 signups in 3 weeks using just the waitlist page. The countdown timer created massive urgency.",
    founder: "Priya Sharma",
    founderRole: "Founder",
    founderImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop&q=80",
    color: "from-emerald-500 to-teal-600",
    tag: "Analytics",
  },
  {
    name: "Stacklane",
    tagline: "Ship full-stack apps in minutes",
    result: "#1 Product of the Day",
    upvotes: "1,847",
    signups: "4,100",
    referralRate: "2.4x",
    quote: "The press kit section alone saved me 15 hours. When TechCrunch reached out, I had everything ready to send in one click.",
    founder: "Jake Morrison",
    founderRole: "Solo Founder",
    founderImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=500&fit=crop&q=80",
    color: "from-orange-500 to-amber-600",
    tag: "Developer Tools",
  },
  {
    name: "CalmSpace",
    tagline: "Meditation meets productivity",
    result: "#3 Product of the Day",
    upvotes: "987",
    signups: "2,800",
    referralRate: "3.5x",
    quote: "The referral system turned every signup into a mini-ambassador. Our waitlist grew 340% without spending a single dollar on ads.",
    founder: "Lena Park",
    founderRole: "CEO",
    founderImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=500&fit=crop&q=80",
    color: "from-cyan-500 to-blue-600",
    tag: "Wellness",
  },
];

const brandLogos = [
  {
    name: "Slack",
    svg: (
      <svg viewBox="0 0 127 127" className="h-10 w-10" fill="currentColor">
        <path d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2S.8 87.3.8 80s5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2s-13.2-5.9-13.2-13.2V80z" />
        <path d="M47 27c-7.3 0-13.2-5.9-13.2-13.2S39.7.6 47 .6s13.2 5.9 13.2 13.2V27H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2H13.9C6.6 60.1.7 54.2.7 46.9s5.9-13.2 13.2-13.2H47z" />
        <path d="M99.9 46.9c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2-5.9 13.2-13.2 13.2H99.9V46.9zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2s-13.2-5.9-13.2-13.2V13.8C66.9 6.5 72.8.6 80.1.6s13.2 5.9 13.2 13.2v33.1z" />
        <path d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2s5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2H80.1z" />
      </svg>
    ),
  },
  {
    name: "Notion",
    svg: (
      <svg viewBox="0 0 100 100" className="h-10 w-10" fill="currentColor">
        <path d="M6.017 4.313l55.333-4.087c6.797-.583 8.543-.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277-1.553 6.807-6.99 7.193L24.467 99.967c-4.08.193-6.023-.39-8.16-3.113L3.3 79.94c-2.333-3.113-3.3-5.443-3.3-8.167V11.113c0-3.497 1.553-6.413 6.017-6.8z" fillRule="evenodd" />
        <path d="M61.35.227L6.017 4.313C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723.967 5.053 3.3 8.167l12.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257-3.89c5.433-.387 6.99-2.917 6.99-7.193V20.64c0-2.21-.873-2.847-3.443-4.733L74.167 3.143C69.893.027 68.147-.357 61.35.227zM25.6 19.523c-5.247.33-6.437.403-9.417-2.15L10.15 12.18c-.777-.78-.35-1.753 1.553-1.947l53.193-3.887c4.467-.387 6.793 1.167 8.543 2.527l7.38 5.443c.39.193-.193.967-1.17 1.063l-54.05 4.147zm-4.66 72.75V30.953c0-2.527.777-3.693 3.113-3.89l58.723-3.5c2.14-.193 3.107 1.167 3.107 3.693v60.93c0 2.53-.39 4.673-3.887 4.863l-56.193 3.307c-3.497.193-4.863-.97-4.863-3.693zm55.25-57.477c.387 1.75 0 3.5-1.75 3.7l-2.72.517v44.287c-2.333 1.26-4.473 1.943-6.22 1.943-2.913 0-3.65-.917-5.833-3.633L42.1 51.67v27.263l5.64 1.26s0 3.5-4.86 3.5l-13.4.777c-.39-.78 0-2.723 1.357-3.11l3.497-.943V41.403l-4.86-.387c-.39-1.75.58-4.277 3.3-4.47l14.367-.967 19.8 30.327V41.6l-4.667-.58c-.39-2.14 1.167-3.693 3.107-3.887l13.4-.777z" fill="#fff" fillRule="evenodd" />
      </svg>
    ),
  },
  {
    name: "Figma",
    svg: (
      <svg viewBox="0 0 38 57" className="h-10 w-7" fill="currentColor">
        <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" />
        <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" />
        <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" />
        <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" />
        <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" />
      </svg>
    ),
  },
  {
    name: "Stripe",
    svg: (
      <svg viewBox="0 0 60 25" className="h-9 w-[72px]" fill="currentColor">
        <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a12.3 12.3 0 0 1-4.56.85c-4.05 0-6.83-2.51-6.83-7.14 0-4.08 2.32-7.15 6.14-7.15 3.83 0 6.06 3.07 6.06 7.15v1.37zm-4.14-5.26c-1.12 0-2.04.93-2.17 2.67h4.25c-.05-1.63-.78-2.67-2.08-2.67zM42.72 21.14V6.23h3.84l.3 1.74a5.66 5.66 0 0 1 4.14-2.1v4.18c-2.36-.16-3.63.46-4.14 1.15v9.94h-4.14zM37.56 2.09c0 1.37-1.04 2.35-2.46 2.35s-2.46-.98-2.46-2.35S33.68 0 35.1 0s2.46.72 2.46 2.09zm-4.53 19.05V6.23h4.14v14.91h-4.14zM28.26 11.63c0-1.56-.67-2.3-1.97-2.3-.93 0-1.87.53-2.58 1.15v10.66h-4.14V6.23h3.84l.3 1.74c1.2-1.16 2.79-2.1 4.56-2.1 3.06 0 4.14 2.06 4.14 5.12v10.15h-4.14v-9.51zM14.88 21.5c-1.74 0-3.48-.37-4.79-1.15l.88-3.12c1.12.56 2.65.98 3.83.98.98 0 1.41-.28 1.41-.84 0-.67-1.16-.88-2.58-1.46-1.73-.7-3.55-1.97-3.55-4.35 0-2.93 2.27-4.8 5.54-4.8 1.55 0 3.06.37 4.05.84l-.88 3.12c-.93-.42-2.18-.79-3.15-.79-.88 0-1.3.33-1.3.74 0 .65 1.12.84 2.51 1.39 1.78.7 3.62 1.86 3.62 4.44 0 3.01-2.36 5-5.59 5z" />
      </svg>
    ),
  },
  {
    name: "Vercel",
    svg: (
      <svg viewBox="0 0 76 65" className="h-8 w-9" fill="currentColor">
        <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
      </svg>
    ),
  },
  {
    name: "Linear",
    svg: (
      <svg viewBox="0 0 100 100" className="h-10 w-10" fill="currentColor">
        <path d="M1.22541 61.5228c-.11984-.8964-.22526-1.7946-.31606-2.6944l36.5743 36.5743c-.8998-.0908-1.798-.1962-2.6944-.3161L1.22541 61.5228zm5.765-10.3424L47.1808 91.3698c-1.4455-.3879-2.8763-.823-4.2904-1.304L3.6867 50.8622c-.4811-1.414-.9162-2.845-1.304-4.2904-.0025.0084-.0049.0168-.0073.0253-.0025-.0085-.005-.017-.0074-.0253-.3878 1.4141-.8229 2.8449-1.304 4.2591l.0313.0314zM.282138 53.8127C-.100684 51.9047-.326691 49.9405-.39115 47.9334l43.19315 43.1932c-2.007-.0645-3.9712-.2905-5.8792-.6733L.282138 53.8127zM.00240112 45.3306C.0392182 43.4118.197498 41.5172.472517 39.6533L51.0787 90.2596c-1.864.275-3.7586.4333-5.6774.4701L.00240112 45.3306zM1.39498 37.1598C1.83986 35.3766 2.39536 33.6295 3.05524 31.924L58.8082 87.677c-1.7055.66-3.4526 1.2155-5.2358 1.6604L1.39498 37.1598zM4.15996 29.826c.78498-1.5752 1.66348-3.1074 2.62956-4.5908L74.4968 92.9424c-1.4834.9661-3.0156 1.8446-4.5908 2.6296L4.15996 29.826zM8.7076 23.3438c1.0392-1.3532 2.156-2.6476 3.3444-3.8787L86.267 93.6802c-1.2311 1.1884-2.5255 2.3052-3.8787 3.3444L8.7076 23.3438zm7.1774-6.0292c1.2363-1.076 2.5278-2.0908 3.8698-3.0404L93.7022 88.2216c-.9496 1.342-1.9644 2.6335-3.0404 3.8698L15.8856 17.3146h-.0006zm8.2464-5.3972c1.3476-.786 2.7346-1.5094 4.1566-2.1668L91.5318 73.0268c-.6574 1.422-1.3808 2.809-2.1668 4.1566L24.1314 11.9174h.0006zM33.604 7.80082c1.5168-.5392 3.0622-.9992 4.632-1.37681L95.9286 64.1164c-.3777 1.5698-.8377 3.1152-1.3769 4.632L33.604 7.80082zM42.1248 5.07376c1.6854-.28201 3.391-.47201 5.1108-.56601l42.9878 42.98795c-.094 1.7198-.284 3.4254-.566 5.1108L42.1248 5.07376zM51.5204 4.55336c1.9072.02401 3.7882.17001 5.636.43401l29.044 29.044c.264 1.8478.41 3.7288.434 5.636L51.5204 4.55336z" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    svg: (
      <svg viewBox="0 0 98 96" className="h-10 w-10" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" />
      </svg>
    ),
  },
  {
    name: "Shopify",
    svg: (
      <svg viewBox="0 0 109 124" className="h-10 w-9" fill="currentColor">
        <path d="M95.8 28.2c-.1-.6-.6-1-1.1-1-.5 0-10.2-.8-10.2-.8s-6.7-6.7-7.5-7.5c-.8-.8-2.3-.5-2.9-.4-.1 0-1.5.5-4 1.2-2.4-6.8-6.5-13.1-13.8-13.1h-.6C53.5 3.6 50.7 2 48.4 2 30.6 2 22 23.5 19.5 35.3c-6.6 2-11.2 3.5-11.8 3.7-3.6 1.1-3.7 1.2-4.2 4.6C3.1 46.4 0 99.6 0 99.6l75.6 13 32.7-8.2S95.9 28.8 95.8 28.2zM67 21.5c-1.9.6-4 1.2-6.4 2V22c0-4.3-.6-7.7-1.5-10.4C63.3 12.3 65.8 16.2 67 21.5zM55 13c1 2.7 1.7 6.5 1.7 11.7v.8c-4.2 1.3-8.7 2.7-13.2 4.1C46 19.7 50 14.4 55 13zM48.1 6.3c.9 0 1.8.3 2.6 1-6.6 3.1-13.6 11-16.6 26.7-3.6 1.1-7.1 2.2-10.3 3.2C26.6 25.4 33.6 6.3 48.1 6.3z" />
        <path d="M94.7 27.2c-.5 0-10.2-.8-10.2-.8s-6.7-6.7-7.5-7.5c-.3-.3-.7-.4-1.1-.5L75.6 112.6l32.7-8.2S95.9 28.8 95.8 28.2c-.1-.5-.6-.9-1.1-1z" opacity=".5" />
        <path d="M59.2 43.7l-4.8 14.2s-4.2-2.2-9.3-2.2c-7.5 0-7.9 4.7-7.9 5.9 0 6.5 17 9 17 24.2 0 12-7.6 19.7-17.8 19.7-12.3 0-18.6-7.6-18.6-7.6l3.3-10.9s6.5 5.6 12 5.6c3.6 0 5.1-2.8 5.1-4.9 0-8.5-14-8.9-14-22.7 0-11.7 8.4-23 25.3-23 6.5 0 9.7 1.9 9.7 1.9z" fill="#fff" />
      </svg>
    ),
  },
  {
    name: "Spotify",
    svg: (
      <svg viewBox="0 0 168 168" className="h-10 w-10" fill="currentColor">
        <path d="M83.996.277C37.747.277.253 37.77.253 84.019c0 46.251 37.494 83.741 83.743 83.741 46.254 0 83.744-37.49 83.744-83.741C167.74 37.77 130.25.277 83.996.277zm38.404 120.78a5.217 5.217 0 0 1-7.18 1.73c-19.662-12.01-44.414-14.73-73.564-8.07a5.222 5.222 0 0 1-6.249-3.93 5.213 5.213 0 0 1 3.926-6.25c31.9-7.291 59.263-4.15 81.337 9.34 2.46 1.51 3.24 4.72 1.73 7.18zm10.25-22.805c-1.89 3.075-5.91 4.045-8.98 2.155-22.51-13.839-56.823-17.846-83.448-9.764-3.453 1.043-7.1-.903-8.148-4.35a6.538 6.538 0 0 1 4.354-8.143c30.413-9.228 68.222-4.758 94.072 11.127 3.07 1.89 4.04 5.91 2.15 8.976zm.88-23.744c-26.99-16.031-71.52-17.505-97.289-9.684-4.138 1.255-8.514-1.081-9.768-5.219a7.835 7.835 0 0 1 5.221-9.771c29.581-8.98 78.756-7.245 109.83 11.202a7.823 7.823 0 0 1 2.74 10.733c-2.2 3.722-7.02 4.949-10.73 2.739z" />
      </svg>
    ),
  },
  {
    name: "Airbnb",
    svg: (
      <svg viewBox="0 0 2500 2500" className="h-10 w-10" fill="currentColor">
        <path d="M1250 75C610.7 75 91.8 593.9 91.8 1233.2s518.9 1158.2 1158.2 1158.2 1158.2-518.9 1158.2-1158.2S1889.3 75 1250 75zm0 533.7c68.3 0 123.7 55.4 123.7 123.7S1318.3 856 1250 856s-123.7-55.4-123.7-123.7 55.4-123.6 123.7-123.6zm354.4 974.5c-24.8 42.9-56 82.6-93.4 117.2-45 41.6-97.5 73.5-155.6 94.2-24.8 8.7-50.2 15.5-76.3 20.5-17.4 3.1-34.4 5.6-50.8 7.5-40.3-1.9-79.3-10.6-115.3-24.8-58.1-20.5-110.6-52.7-155.6-94.2-37.4-34.6-68.6-74.2-93.4-117.2-29.3-50.8-47.4-105.3-56.7-161.4-3.7-21.1-5.6-42.9-7.5-64.6-1.9-60.5 8.7-119.1 27.4-174.6 18.6-55.4 46-108.5 82.6-155.6l24.8-33.9c24.2-33.3 51.5-64 81.3-91.5l24.2-21.7 32.6-30.5c11.2-11.2 23.6-21.1 36.5-30.5 12.4-9.9 25.4-18.6 39.1-26.1 13.7-7.5 27.4-13.7 42.3-19.2 30.5-11.2 63.4-18 97.5-18s67 6.8 97.5 18c14.9 5.6 28.6 11.8 42.3 19.2 13.7 7.5 26.7 16.2 39.1 26.1 12.9 9.3 25.4 19.2 36.5 30.5l32.6 30.5 24.2 21.7c29.9 27.4 57.1 58.1 81.3 91.5l24.8 33.9c36.5 47.1 63.9 100.3 82.6 155.6 18.6 55.4 29.3 114.1 27.4 174.6-1.9 21.7-3.7 43.5-7.5 64.6-9.2 56.1-27.4 110.6-56.6 161.4z" />
      </svg>
    ),
  },
];

export default function ShowcasePage() {
  return (
    <>
      <Navbar />
      <main className="pt-24">
        {/* Hero - Full-width image with overlay */}
        <section className="relative min-h-[60vh] flex items-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=1600&h=900&fit=crop&q=80"
            alt="Startup team celebrating"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--foreground)] via-[var(--foreground)]/80 to-[var(--foreground)]/40" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20">
            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-white/90 mb-6">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                Success stories
              </motion.div>
              <motion.h1 variants={fadeUp} className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                Founders who launched and won
              </motion.h1>
              <motion.p variants={fadeUp} className="text-xl text-white/70 leading-relaxed">
                Real products. Real results. See how founders used HuntReady to hit #1 on Product Hunt and build audiences of thousands.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Logo Strip - 25/75 Layout with Infinite Marquee */}
        <section className="py-14 bg-[var(--surface-alt)] border-b border-[var(--border)] overflow-hidden">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
              {/* Left column - 25% */}
              <div className="md:col-span-1">
                <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold text-[var(--foreground)] leading-tight">
                  Trusted by top brands
                </h2>
              </div>
              {/* Right column - 75% with marquee */}
              <div className="md:col-span-3 relative overflow-hidden">
                {/* White fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--surface-alt)] to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--surface-alt)] to-transparent z-10 pointer-events-none" />
                {/* Scrolling track */}
                <div className="flex animate-marquee">
                  {[...brandLogos, ...brandLogos, ...brandLogos, ...brandLogos].map((logo, i) => (
                    <div key={`${logo.name}-${i}`} className="flex items-center gap-3.5 text-gray-300 px-10 flex-shrink-0">
                      {logo.svg}
                      <span className="text-xl font-semibold whitespace-nowrap text-gray-300">{logo.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Case Studies - Staggered Cards */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-20">
            {caseStudies.map((study, index) => (
              <motion.div
                key={study.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={stagger}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center ${index % 2 !== 0 ? "direction-rtl" : ""}`}
              >
                {/* Image - takes 7 cols */}
                <motion.div
                  variants={fadeUp}
                  className={`lg:col-span-7 ${index % 2 !== 0 ? "lg:order-2" : ""}`}
                >
                  <div className="relative group rounded-2xl overflow-hidden">
                    <img
                      src={study.image}
                      alt={`${study.name} - ${study.tagline}`}
                      className="w-full h-[300px] lg:h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${study.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
                    <div className="absolute top-5 left-5">
                      <span className="bg-white/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full text-[var(--foreground)]">
                        {study.tag}
                      </span>
                    </div>
                    <div className="absolute bottom-5 right-5 bg-white/90 backdrop-blur rounded-xl px-4 py-2.5 flex items-center gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275z" /></svg>
                      <span className="font-bold text-sm text-[var(--foreground)]">{study.result}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Content - takes 5 cols */}
                <motion.div
                  variants={fadeUp}
                  className={`lg:col-span-5 ${index % 2 !== 0 ? "lg:order-1" : ""}`}
                >
                  <h3 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-1">{study.name}</h3>
                  <p className="text-[var(--muted)] mb-6">{study.tagline}</p>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-[var(--surface-alt)] rounded-xl p-4 text-center">
                      <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--foreground)]">{study.upvotes}</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">Upvotes</p>
                    </div>
                    <div className="bg-[var(--surface-alt)] rounded-xl p-4 text-center">
                      <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--foreground)]">{study.signups}</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">Signups</p>
                    </div>
                    <div className="bg-[var(--surface-alt)] rounded-xl p-4 text-center">
                      <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--secondary)]">{study.referralRate}</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">Referral rate</p>
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="border-l-4 border-[var(--accent)] pl-5 mb-6">
                    <p className="text-[var(--foreground)] italic leading-relaxed">&ldquo;{study.quote}&rdquo;</p>
                  </blockquote>

                  {/* Founder */}
                  <div className="flex items-center gap-3">
                    <img src={study.founderImage} alt={study.founder} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-sm text-[var(--foreground)]">{study.founder}</p>
                      <p className="text-xs text-[var(--muted)]">{study.founderRole}, {study.name}</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Results Summary */}
        <section className="py-20 lg:py-28 bg-[var(--surface-alt)]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
              <motion.h2 variants={fadeUp} className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4">
                The numbers speak
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-[var(--muted)] max-w-lg mx-auto">
                Aggregated results from 2,400+ launches powered by HuntReady.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                {
                  metric: "3.2x",
                  label: "More upvotes",
                  description: "Compared to launching without a dedicated pre-launch page",
                  icon: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400&h=300&fit=crop&q=80",
                },
                {
                  metric: "340%",
                  label: "Waitlist growth",
                  description: "Average growth from referral waitlist alone, with zero ad spend",
                  icon: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&q=80",
                },
                {
                  metric: "40hrs",
                  label: "Time saved",
                  description: "Average time founders save vs building a launch page from scratch",
                  icon: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&q=80",
                },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  className="bg-white rounded-2xl overflow-hidden border border-[var(--border)] group hover:shadow-xl hover:shadow-[var(--accent)]/5 transition-all duration-300"
                >
                  <div className="h-44 md:h-48 overflow-hidden">
                    <img src={item.icon} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-[var(--accent)] mb-1">{item.metric}</h3>
                    <p className="font-bold text-[var(--foreground)] mb-2">{item.label}</p>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonial Mosaic */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.h2 variants={fadeUp} className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-14 text-center">
                What founders say
              </motion.h2>
              <motion.div variants={stagger} className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
                {[
                  { text: "Set up our launch page in under an hour. The countdown timer and auto-switch to PH voting was genius.", name: "Tom H.", role: "Founder, DevBoard", color: "bg-indigo-50 border-indigo-100" },
                  { text: "Our referral waitlist grew from 200 to 3,400 in 18 days. The position tracker made people obsessed with sharing.", name: "Anika R.", role: "CEO, LoopIn", color: "bg-amber-50 border-amber-100" },
                  { text: "Saved me from hiring a designer. The page looked better than anything I could've commissioned for $5,000.", name: "Chris L.", role: "Solo Founder", color: "bg-emerald-50 border-emerald-100" },
                  { text: "The press kit was a game-changer. Three publications covered us on launch day because we made their job so easy.", name: "Maria S.", role: "Co-founder, Artful", color: "bg-rose-50 border-rose-100" },
                  { text: "I've launched 6 products on PH. HuntReady is the first tool that actually understands what matters on launch day.", name: "David K.", role: "Serial Founder", color: "bg-cyan-50 border-cyan-100" },
                  { text: "The demo embed section converted like crazy. People who watched our Loom were 4x more likely to sign up.", name: "Nina P.", role: "CTO, Flowbase", color: "bg-violet-50 border-violet-100" },
                  { text: "We hit #1 Product of the Day. Would not have happened without the pre-launch buzz HuntReady helped us build.", name: "Ryan M.", role: "Founder, Quickform", color: "bg-orange-50 border-orange-100" },
                  { text: "The founder story section humanized our brand. People connected with WHY we built it, not just what it does.", name: "Zara T.", role: "CEO, Mindful", color: "bg-pink-50 border-pink-100" },
                  { text: "Integration with Mailchimp was seamless. Every signup went straight to our nurture sequence automatically.", name: "Leo B.", role: "Growth, Startify", color: "bg-teal-50 border-teal-100" },
                ].map((t) => (
                  <motion.div
                    key={t.name}
                    variants={fadeUp}
                    className={`${t.color} border rounded-2xl p-6 break-inside-avoid`}
                  >
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      ))}
                    </div>
                    <p className="text-[var(--foreground)] leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{t.name}</p>
                    <p className="text-xs text-[var(--muted)]">{t.role}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="bg-[var(--accent)] py-20 px-6 lg:px-16 flex items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-lg">
                <motion.h2 variants={fadeUp} className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-white mb-4">
                  Your launch story starts here
                </motion.h2>
                <motion.p variants={fadeUp} className="text-white/70 text-lg mb-8">
                  Join 2,400+ founders who stopped worrying about their launch page and started focusing on their product.
                </motion.p>
                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="you@startup.com"
                    aria-label="Email address"
                    className="flex-1 px-5 py-3.5 rounded-xl text-[var(--foreground)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button className="bg-[var(--secondary)] hover:bg-orange-600 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors whitespace-nowrap">
                    Get Started
                  </button>
                </motion.div>
              </motion.div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop&q=80"
                alt="Team working on laptops"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
