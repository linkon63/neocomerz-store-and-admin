import Image from "next/image";
import Link from "next/link";

export default function CharterCTA() {
  return (
    <section
      className="relative w-full py-24 md:py-32 overflow-hidden"
      id="sign-charter"
      style={{ background: "linear-gradient(135deg, #1C221F 0%, #2e3a32 60%, #1C221F 100%)" }}
    >
      {/* Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "url('/images/pattern/pattern.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "150px 150px",
        }}
      />

      {/* Decorative line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-khaki-gold/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-khaki-gold/40 to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 text-center">
        {/* Fair Pay Charter Logo Badge */}
        <div className="flex justify-center mb-10">
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-khaki-gold/40 bg-white/10 backdrop-blur-sm p-3">
            <Image
              src="/images/quality/Fair Pay Charter.png"
              alt="Fair Pay Charter Seal"
              fill
              className="object-contain p-3"
            />
          </div>
        </div>

        <p className="font-['Gotham'] text-xs uppercase tracking-[0.3em] text-khaki-gold mb-5">
          Join the Movement
        </p>

        <h2 className="font-['Bembo_Std'] text-3xl md:text-4xl lg:text-6xl font-normal text-white leading-tight mb-6">
          Be a Champion of{" "}
          <span className="font-['Snell_Roundhand_LT_Std'] italic text-khaki-gold">
            Fair Pay
          </span>
        </h2>

        <p className="font-['Bembo_Std'] text-base md:text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          Whether you are a business, estate, or individual who believes in ethical trade — 
          your commitment matters. Sign the Global Fair Pay Charter and stand on the right side of history.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <Link
            href="/contact"
            className="font-['Gotham'] text-xs uppercase tracking-wider bg-khaki-gold text-white px-10 py-4 rounded-full hover:bg-khaki-gold/80 transition-colors"
          >
            Sign the Charter
          </Link>
          <Link
            href="/about"
            className="font-['Gotham'] text-xs uppercase tracking-wider border border-white/30 text-white px-10 py-4 rounded-full hover:bg-white/10 transition-colors"
          >
            Our Story
          </Link>
        </div>

        {/* UN Partnership Badge */}
        <div className="flex items-center justify-center gap-6 opacity-60">
          <div className="w-px h-8 bg-white/30" />
          <p className="font-['Gotham'] text-xs text-white/60 uppercase tracking-[0.2em]">
            In partnership with the United Nations (UNITAR)
          </p>
          <div className="w-px h-8 bg-white/30" />
        </div>
      </div>
    </section>
  );
}
