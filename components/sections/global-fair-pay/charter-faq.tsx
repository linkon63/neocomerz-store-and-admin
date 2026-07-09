"use client";

import { useState } from "react";

const faqs = [
  {
    q: "What is the Global Fair Pay Charter?",
    a: "The Global Fair Pay Charter is a framework developed by London Tea Exchange that sets minimum standards for fair pay, safe working conditions, and ethical treatment of all workers in our supply chain. It is formally recognised by the United Nations through UNITAR.",
  },
  {
    q: "How does London Tea Exchange verify compliance?",
    a: "We conduct annual on-site audits at every partner estate and processing facility. Our team of independent auditors evaluates wage records, worker interviews, safety inspections, and environmental practices before issuing or renewing a charter certification.",
  },
  {
    q: "Who can become a signatory?",
    a: "Any tea estate, processing facility, logistics partner, or retailer that meets our baseline standards can apply to become a signatory. We welcome applications from all regions of the world. Our team will guide you through the onboarding and audit process.",
  },
  {
    q: "What happens if a signatory violates the charter?",
    a: "Violations are taken extremely seriously. Upon discovery, a formal notice is issued and a corrective action plan must be agreed within 30 days. Repeat or serious violations result in immediate suspension and removal from our supply chain.",
  },
  {
    q: "How does the UNITAR partnership work?",
    a: "UNITAR (United Nations Institute for Training and Research) provides institutional recognition, training programmes, and advocacy support for the Charter. They help us scale the programme globally and connect it to wider UN Sustainable Development Goals.",
  },
  {
    q: "How can my company support the Charter?",
    a: "You can support the Charter by signing it as a partner organisation, purchasing from London Tea Exchange, sharing our mission, or making a corporate pledge. Contact our sustainability team to discuss how your business can get involved.",
  },
];

export default function CharterFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="w-full py-20 md:py-28 px-6 md:px-12 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="font-['Gotham'] text-xs uppercase tracking-[0.3em] text-khaki-gold mb-4">
            Common Questions
          </p>
          <h2 className="font-['Bembo_Std'] text-3xl md:text-4xl lg:text-5xl font-normal text-dark-charcoal leading-tight">
            Frequently{" "}
            <span className="font-['Snell_Roundhand_LT_Std'] italic text-khaki-gold">Asked</span>
          </h2>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-pearl-gray overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full text-left flex items-center justify-between px-6 py-5 hover:bg-off-white transition-colors"
                aria-expanded={openIdx === idx}
              >
                <span className="font-['Gotham'] text-sm font-medium text-dark-charcoal pr-4">
                  {faq.q}
                </span>
                <span
                  className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full border border-khaki-gold/40 text-khaki-gold transition-transform duration-200 ${
                    openIdx === idx ? "rotate-45" : ""
                  }`}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </button>

              {openIdx === idx && (
                <div className="px-6 pb-6 pt-1 border-t border-pearl-gray bg-off-white/50">
                  <p className="font-['Bembo_Std'] text-sm md:text-base text-stone-gray leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
