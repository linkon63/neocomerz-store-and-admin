"use client";

import { useState, useEffect } from "react";
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
  IoMailOutline,
  IoSparklesOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Set target launch date (30 days from current date or custom date)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 28,
    hours: 14,
    minutes: 45,
    seconds: 30,
  });

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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setEmail("");
    }, 800);
  };

  return (
    <main className="min-h-screen w-full relative bg-[#171A17] text-white flex flex-col justify-between overflow-x-hidden select-none font-gotham">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-radial from-[#C5A880]/15 via-[#b4a676]/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-radial from-[#51524e]/20 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#C5A880_0.75px,transparent_1px)] [background-size:28px_28px] opacity-[0.04] pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo/Logo-update.png"
            alt="London Tea Exchange"
            width={72}
            height={72}
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_4px_20px_rgba(197,168,128,0.3)]"
            priority
          />
          <div className="text-left">
            <span className="block font-bembo text-lg sm:text-xl font-bold tracking-[0.2em] text-[#C5A880] uppercase">
              London Tea Exchange
            </span>
            <span className="block text-[10px] sm:text-[11px] font-medium tracking-[0.3em] text-stone-400 uppercase">
              Bangladesh Flagship
            </span>
          </div>
        </div>

        {/* Location & Concierge info */}
        <div className="flex items-center gap-6 text-xs text-stone-300">
          <div className="hidden md:flex items-center gap-2">
            <IoLocationOutline className="w-4 h-4 text-[#C5A880]" />
            <span>Pan Pacific Sonargaon, Dhaka</span>
          </div>
          <a
            href="tel:+8801339879494"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-[#C5A880]/50 hover:bg-white/10 transition-colors text-white"
          >
            <IoCallOutline className="w-3.5 h-3.5 text-[#C5A880]" />
            <span className="text-[11px] font-medium tracking-wide">+880 13 3987 9494</span>
          </a>
        </div>
      </header>

      {/* Center Main Hero */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-16 text-center flex flex-col items-center justify-center my-auto">
        {/* Luxury Crest / Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/25 text-[#C5A880] text-xs uppercase tracking-[0.25em] font-medium mb-6 backdrop-blur-sm animate-pulse">
          <IoSparklesOutline className="w-3.5 h-3.5" />
          <span>Something Truly Exquisite is Brewing</span>
          <IoSparklesOutline className="w-3.5 h-3.5" />
        </div>

        {/* Script Intro Tag */}
        <p className="font-snell text-3xl sm:text-4xl md:text-5xl text-[#C5A880] mb-3">
          An Extraordinary Experience Awaits
        </p>

        {/* Main Headline */}
        <h1 className="font-bembo text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
          Our Digital Flagship Is{" "}
          <span className="bg-gradient-to-r from-[#C5A880] via-[#E4D1B5] to-[#b4a676] bg-clip-text text-transparent italic font-bembo">
            Opening Soon
          </span>
        </h1>

        {/* Description */}
        <p className="text-stone-300 text-sm sm:text-base md:text-lg max-w-2xl font-light leading-relaxed mb-10">
          We are crafting an exclusive digital sanctuary bringing the world’s most prestigious
          single-estate teas and royal heritage blends directly to Bangladesh.
        </p>

        {/* Countdown Timer */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 mb-12 w-full max-w-xl">
          {[
            { label: "DAYS", value: timeLeft.days },
            { label: "HOURS", value: timeLeft.hours },
            { label: "MINUTES", value: timeLeft.minutes },
            { label: "SECONDS", value: timeLeft.seconds },
          ].map((item, index) => (
            <div
              key={index}
              className="group relative flex flex-col items-center justify-center p-3 sm:p-5 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-[#C5A880]/40 transition-all duration-300 shadow-xl"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#C5A880]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="font-bembo text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                {String(item.value).padStart(2, "0")}
              </span>
              <span className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C5A880] mt-1">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* VIP Invitation / Newsletter Form */}
        <div className="w-full max-w-md mx-auto mb-10">
          {subscribed ? (
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/40 text-white animate-fade-in">
              <IoCheckmarkCircleOutline className="w-6 h-6 text-[#C5A880] shrink-0" />
              <div className="text-left text-xs sm:text-sm">
                <p className="font-semibold text-[#C5A880]">You are on the VIP Guestlist</p>
                <p className="text-stone-300">We will notify you the moment our doors open.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="relative flex flex-col sm:flex-row gap-2 sm:gap-0">
              <div className="relative flex-grow">
                <IoMailOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email for VIP launch access..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/[0.06] backdrop-blur-md border border-white/15 rounded-xl sm:rounded-r-none text-white text-xs sm:text-sm placeholder:text-stone-400 outline-none focus:border-[#C5A880] transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3.5 bg-gradient-to-r from-[#C5A880] to-[#b4a676] hover:from-[#d2c494] hover:to-[#C5A880] text-[#171A17] font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-xl sm:rounded-l-none transition-all duration-300 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Joining..." : "Notify Me"}
              </button>
            </form>
          )}
          <p className="text-[11px] text-stone-400 mt-2.5">
            Be the first to receive exclusive preview access & private tasting invites.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl pt-4 border-t border-white/5">
          <div className="flex items-center justify-center sm:justify-start gap-3 p-3 rounded-lg bg-white/[0.02]">
            <span className="text-[#C5A880] text-lg">⚜</span>
            <div className="text-left">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Royal Heritage</h4>
              <p className="text-[11px] text-stone-400">Directly from London</p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-3 p-3 rounded-lg bg-white/[0.02]">
            <span className="text-[#C5A880] text-lg">🌿</span>
            <div className="text-left">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Single-Estate Harvest</h4>
              <p className="text-[11px] text-stone-400">Rarest global tea gardens</p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-3 p-3 rounded-lg bg-white/[0.02]">
            <span className="text-[#C5A880] text-lg">✨</span>
            <div className="text-left">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Master Tea Sommelier</h4>
              <p className="text-[11px] text-stone-400">Curated bespoke blends</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
        <p className="text-center sm:text-left">
          © {new Date().getFullYear()} London Tea Exchange Bangladesh. All rights reserved.
        </p>

        {/* Social Icons */}
        <div className="flex items-center gap-4">
          <span className="text-stone-400 text-xs hidden md:inline">Follow Our Journey:</span>
          <Link
            href="https://www.facebook.com/londonteaexchange/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-[#C5A880] hover:text-[#C5A880] flex items-center justify-center transition-colors"
            aria-label="Facebook"
          >
            <FaFacebookF className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="https://www.instagram.com/lte_bd/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-[#C5A880] hover:text-[#C5A880] flex items-center justify-center transition-colors"
            aria-label="Instagram"
          >
            <FaInstagram className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="https://www.youtube.com/@LondonTeaExchangebd/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-[#C5A880] hover:text-[#C5A880] flex items-center justify-center transition-colors"
            aria-label="YouTube"
          >
            <FaYoutube className="w-3.5 h-3.5" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
