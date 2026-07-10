import Image from "next/image";

export default function CharterQuote() {
  return (
    <section className="w-full bg-white py-16 md:py-24 px-6 md:px-12 flex flex-col items-center justify-center text-center">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Fleur-de-lis inside Circle */}
        <div className="w-14 h-14 rounded-full border border-zinc-200 flex items-center justify-center mb-8 bg-white shadow-xs ring-1 ring-khaki-gold/20">
          <img
            src="/images/icons/icon-3.svg"
            alt="Fleur-de-lis"
            className="w-5 h-5 object-contain opacity-60"
          />
        </div>

        {/* Quote Text */}
        <p className="font-['Bembo_Std'] text-2xl md:text-[32px] font-normal text-dark-charcoal leading-[1.45] tracking-wide mb-8 max-w-3xl">
          Signing the Charter at Mansion House was a chance to put the City of London's name behind something concrete: fair pay for tea workers, not as a slogan, but as a written commitment with named signatories attached to it.
        </p>

        {/* Author / Attribution */}
        <p className="font-['Bembo_Std'] italic text-xs md:text-sm text-neutral-400 max-w-2xl leading-relaxed">
          — Paraphrased from remarks by Professor Michael Mainelli, Lord Mayor of the City of London, on signing the Charter, May 2024
        </p>
      </div>
    </section>
  );
}
