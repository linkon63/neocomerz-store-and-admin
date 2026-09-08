"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa6";
import {
  IoCallOutline,
  IoLocationOutline,
  IoSparklesOutline,
  IoMailOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function ComingSoon() {
  // Target countdown state
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 28,
    hours: 14,
    minutes: 45,
    seconds: 30,
  });

  // VIP invitation email state
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
    }
  };

  useEffect(() => {
    // Dynamic countdown calculation
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 25);
    targetDate.setHours(targetDate.getHours() + 18);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen w-full relative bg-[#0D100D] text-white flex flex-col justify-between overflow-x-hidden select-none font-gotham">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] max-w-[95vw] h-[550px] bg-[radial-gradient(circle_at_center,rgba(197,168,128,0.20)_0%,rgba(180,166,118,0.08)_40%,transparent_75%)] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(60,75,60,0.25)_0%,transparent_70%)] blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(197,168,128,0.10)_0%,transparent_70%)] blur-3xl pointer-events-none" />

      {/* Royal Heritage Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] bg-repeat [background-size:240px_240px]"
        style={{
          backgroundImage: "url('/images/pattern/pattern.png')",
        }}
      />

      {/* Subtle Star / Luxury Dot Lattice */}
      <div className="absolute inset-0 bg-[radial-gradient(#C5A880_0.75px,transparent_1px)] [background-size:32px_32px] opacity-[0.035] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-7 flex items-center justify-between gap-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="relative p-1 rounded-full bg-white/[0.03] border border-[#C5A880]/30 shadow-[0_0_15px_rgba(197,168,128,0.2)] shrink-0">
            <Image
              src="/images/logo/Logo-update.png"
              alt="London Tea Exchange"
              width={56}
              height={56}
              className="w-10 h-10 sm:w-13 sm:h-13 object-contain"
              priority
            />
          </div>
          <div className="text-left">
            <span className="block font-bembo text-base sm:text-xl font-bold tracking-[0.16em] sm:tracking-[0.22em] text-[#C5A880] uppercase leading-tight">
              London Tea Exchange
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 text-[9px] sm:text-[11px] font-medium tracking-[0.22em] text-stone-400 uppercase">
              <span>Bangladesh Flagship</span>
              <span className="hidden xs:inline text-[#C5A880]">•</span>
              <span className="hidden xs:inline text-stone-500">Pan Pacific Sonargaon</span>
            </div>
          </div>
        </div>

        {/* Location & Concierge Access */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs text-stone-300">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10">
            <IoLocationOutline className="w-4 h-4 text-[#C5A880]" />
            <span className="text-stone-300 tracking-wide text-[11px]">Pan Pacific Sonargaon, Dhaka</span>
          </div>
          <a
            href="tel:+8801339879494"
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-white/[0.06] to-white/[0.02] border border-[#C5A880]/40 hover:border-[#C5A880] hover:bg-white/10 transition-all duration-300 text-white shadow-lg shadow-black/20"
            title="Call Concierge"
          >
            <IoCallOutline className="w-3.5 h-3.5 text-[#C5A880]" />
            <span className="text-[10px] sm:text-[11px] font-medium tracking-wider hidden sm:inline">+880 13 3987 9494</span>
            <span className="text-[10px] font-medium tracking-wider sm:hidden">Call</span>
          </a>
        </div>
      </header>

      {/* Center Main Hero */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-14 text-center flex flex-col items-center justify-center my-auto w-full">
        {/* Royal Crest Icon Emblem */}
        <div className="relative mb-3.5 sm:mb-5 flex items-center justify-center">
          <div className="w-12 h-12 sm:w-15 sm:h-15 rounded-full bg-gradient-to-b from-[#C5A880]/20 to-transparent border border-[#C5A880]/40 flex items-center justify-center backdrop-blur-md shadow-[0_0_25px_rgba(197,168,128,0.25)]">
            <Image
              src="/images/icons/icon-3.svg"
              alt="London Tea Exchange Crest"
              width={28}
              height={36}
              className="object-contain opacity-90 drop-shadow-[0_2px_8px_rgba(197,168,128,0.4)]"
            />
          </div>
        </div>

        {/* Luxury Crest / Badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2.5 px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/30 text-[#C5A880] text-[9.5px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.28em] font-medium mb-3.5 sm:mb-5 backdrop-blur-md shadow-lg shadow-black/20 max-w-full">
          <IoSparklesOutline className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C5A880] shrink-0" />
          <span className="truncate">Something Truly Exquisite is Brewing</span>
          <IoSparklesOutline className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C5A880] shrink-0" />
        </div>

        {/* Script Intro Tag */}
        <p className="font-snell text-2xl sm:text-4xl md:text-5xl text-[#C5A880] mb-2 sm:mb-3 tracking-wide">
          An Extraordinary Experience Awaits
        </p>

        {/* Main Headline */}
        <h1 className="font-bembo text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-[0.05em] sm:tracking-[0.14em] text-white max-w-5xl leading-[1.22] sm:leading-[1.18] mb-3.5 sm:mb-5 drop-shadow-md">
          OUR ONLINE PLATFORM IS{" "}
          <span className="bg-gradient-to-r from-[#C5A880] via-[#F7EBD9] to-[#b4a676] bg-clip-text text-transparent inline-block">
            OPENING SOON
          </span>
        </h1>

        {/* Royal Ornamental Divider */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full max-w-[200px] sm:max-w-xs mx-auto mb-4 sm:mb-6">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#C5A880]/40 to-[#C5A880]/70" />
          <span className="text-[#C5A880] text-xs sm:text-sm tracking-widest">⚜</span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#C5A880]/40 to-[#C5A880]/70" />
        </div>

        {/* Description */}
        <p className="text-stone-300 text-xs sm:text-base md:text-lg max-w-2xl font-light leading-relaxed mb-6 sm:mb-10 px-2">
          We are crafting an exclusive digital sanctuary bringing the world’s most prestigious
          single-estate teas and royal heritage blends directly to Bangladesh.
        </p>

        {/* Horology-Style Countdown Timer */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 mb-8 sm:mb-12 w-full max-w-2xl">
          {[
            { labelShort: "DAYS", labelFull: "DAYS", value: timeLeft.days },
            { labelShort: "HRS", labelFull: "HOURS", value: timeLeft.hours },
            { labelShort: "MINS", labelFull: "MINUTES", value: timeLeft.minutes },
            { labelShort: "SECS", labelFull: "SECONDS", value: timeLeft.seconds },
          ].map((item, index) => (
            <div
              key={index}
              className="group relative flex flex-col items-center justify-center p-2.5 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-b from-white/[0.06] via-white/[0.03] to-transparent backdrop-blur-xl border border-[#C5A880]/25 hover:border-[#C5A880]/60 transition-all duration-500 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
            >
              {/* Corner Accents */}
              <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 border-t border-l border-[#C5A880]/40" />
              <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 border-t border-r border-[#C5A880]/40" />
              <div className="absolute bottom-1 left-1 sm:bottom-1.5 sm:left-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 border-b border-l border-[#C5A880]/40" />
              <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 border-b border-r border-[#C5A880]/40" />

              {/* Top ambient highlight */}
              <div className="absolute inset-x-2 sm:inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#C5A880]/50 to-transparent" />
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#C5A880]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Digit Value */}
              <span className="font-bembo text-xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-b from-white via-stone-100 to-[#E4D1B5] bg-clip-text text-transparent tracking-tight leading-none">
                {String(item.value).padStart(2, "0")}
              </span>

              {/* Responsive Label */}
              <span className="text-[8px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.25em] text-[#C5A880] mt-1.5 sm:mt-2">
                <span className="sm:hidden">{item.labelShort}</span>
                <span className="hidden sm:inline">{item.labelFull}</span>
              </span>
            </div>
          ))}
        </div>

        {/* VIP Early Access Invitation Form */}
        <div className="w-full max-w-lg mb-8 sm:mb-12">
          {submitted ? (
            <div className="flex items-center justify-center gap-2 p-3 sm:p-4 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/40 text-[#C5A880] text-xs sm:text-sm animate-fadeIn">
              <IoCheckmarkCircleOutline className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span>Thank you. You are on our private VIP guestlist.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-[#C5A880] font-medium mb-2.5">
                Request Private Launch Invitation
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2 p-1 sm:p-1.5 rounded-xl bg-white/[0.04] border border-[#C5A880]/30 backdrop-blur-md focus-within:border-[#C5A880] transition-colors shadow-xl">
                <div className="flex items-center gap-2 w-full px-3 py-2 text-stone-300">
                  <IoMailOutline className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-stone-500 outline-none font-gotham"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 sm:py-2.5 rounded-lg bg-gradient-to-r from-[#C5A880] via-[#D4BA94] to-[#B4A676] hover:brightness-110 active:scale-[0.98] text-stone-950 font-semibold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-300 whitespace-nowrap shadow-lg shadow-[#C5A880]/20 cursor-pointer"
                >
                  Notify Me
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Trio of Heritage Feature Highlights */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-3xl pt-6 sm:pt-8 border-t border-white/[0.08]">
          <div className="group flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-1.5 sm:gap-3.5 p-2.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#C5A880]/30 hover:bg-white/[0.04] transition-all duration-300">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#C5A880]/10 flex items-center justify-center text-[#C5A880] text-sm sm:text-lg group-hover:scale-110 transition-transform shrink-0">
              ⚜
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-[10px] sm:text-xs font-semibold text-white uppercase tracking-wider leading-tight">Royal Heritage</h4>
              <p className="text-[9px] sm:text-[11px] text-stone-400 mt-0.5 hidden xs:block">From London</p>
            </div>
          </div>

          <div className="group flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-1.5 sm:gap-3.5 p-2.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#C5A880]/30 hover:bg-white/[0.04] transition-all duration-300">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#C5A880]/10 flex items-center justify-center text-[#C5A880] text-sm sm:text-lg group-hover:scale-110 transition-transform shrink-0">
              🌿
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-[10px] sm:text-xs font-semibold text-white uppercase tracking-wider leading-tight">Single-Estate</h4>
              <p className="text-[9px] sm:text-[11px] text-stone-400 mt-0.5 hidden xs:block">Global Gardens</p>
            </div>
          </div>

          <div className="group flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-1.5 sm:gap-3.5 p-2.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#C5A880]/30 hover:bg-white/[0.04] transition-all duration-300">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#C5A880]/10 flex items-center justify-center text-[#C5A880] text-sm sm:text-lg group-hover:scale-110 transition-transform shrink-0">
              🫖
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-[10px] sm:text-xs font-semibold text-white uppercase tracking-wider leading-tight">Sommelier</h4>
              <p className="text-[9px] sm:text-[11px] text-stone-400 mt-0.5 hidden xs:block">Bespoke Blends</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-12 sm:pb-6 border-t border-white/[0.08] flex flex-col-reverse sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
        <p className="text-center sm:text-left text-[10px] sm:text-xs">
          © {new Date().getFullYear()} London Tea Exchange Bangladesh. All rights reserved.
        </p>

        {/* Social Icons */}
        <div className="flex items-center gap-3">
          <span className="text-stone-400 text-xs hidden md:inline tracking-wider">Follow Our Journey:</span>
          <Link
            href="https://www.facebook.com/londonteaexchange/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/[0.04] border border-white/10 hover:border-[#C5A880] hover:text-[#C5A880] hover:bg-[#C5A880]/10 flex items-center justify-center transition-all duration-300"
            aria-label="Facebook"
          >
            <FaFacebookF className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
          </Link>
          <Link
            href="https://www.instagram.com/lte_bd/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/[0.04] border border-white/10 hover:border-[#C5A880] hover:text-[#C5A880] hover:bg-[#C5A880]/10 flex items-center justify-center transition-all duration-300"
            aria-label="Instagram"
          >
            <FaInstagram className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
          </Link>
          <Link
            href="https://www.youtube.com/@LondonTeaExchangebd/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/[0.04] border border-white/10 hover:border-[#C5A880] hover:text-[#C5A880] hover:bg-[#C5A880]/10 flex items-center justify-center transition-all duration-300"
            aria-label="YouTube"
          >
            <FaYoutube className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
