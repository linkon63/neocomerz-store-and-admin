import { FiGlobe, FiUsers, FiBriefcase, FiUser } from "react-icons/fi";
import ScrollReveal from "@/components/ui/scroll-reveal";

const countries = [
  "UNITED KINGDOM",
  "BANGLADESH",
  "INDIA",
  "SRI LANKA",
  "KENYA",
  "MALAWI",
  "CHINA",
  "TURKEY"
];

const founders = [
  {
    name: "SHEIKH ALIUR RAHMAN OBE",
    role: "Founder; Group Chairman, London Tea Exchange"
  },
  {
    name: "DAME LAURAN BUSH",
    role: "Chief of Staff, Global Fair Pay Charter"
  },
  {
    name: "NIKHIL SETH",
    role: "UN Assistant Secretary-General & UNITAR Executive Director"
  },
  {
    name: "DANIEL NAZAROV",
    role: "Senior Programme Coordinator, UNITAR"
  },
  {
    name: "BILLY CHAN",
    role: "UNITAR Ambassador, Asia-Pacific region"
  },
  {
    name: "PROF. MICHAEL MAINELLI",
    role: "Lord Mayor of the City of London at signing, May 2024"
  }
];

const organizations = [
  {
    name: "UNITAR",
    subtitle: "UN Institute for Training & Research",
    desc: "Co-launched the Charter and signed to establish the Fair Pay Foundation, May 2024."
  },
  {
    name: "COMMONWEALTH SECRETARIAT",
    subtitle: "Endorsing office",
    desc: "Signed at Mansion House by Secretary-General the Rt Hon Patricia Scotland."
  },
  {
    name: "CITY OF LONDON",
    subtitle: "Host & signatory",
    desc: "Represented by Lord Mayor Professor Michael Mainelli at the official launch."
  },
  {
    name: "MAYOR OF LONDON",
    subtitle: "Endorsing office",
    desc: "Sadiq Khan endorsed the Charter at its Mansion House launch."
  },
  {
    name: "FAIR PAY FOUNDATION",
    subtitle: "Implementation & monitoring body",
    desc: "Established 2024 to monitor wage progress and support Charter adoption."
  },
  {
    name: "OXFAM BANGLADESH",
    subtitle: "Signatory partner",
    desc: "Took part in a signing ceremony at Oxford, reported in 2025."
  }
];

export default function CharterPeople() {
  return (
    <section className="w-full bg-white py-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ScrollReveal delay={0} direction="up" className="mb-16">
          <p className="font-['Gotham'] text-xs uppercase tracking-[0.25em] text-neutral-400 mb-3">
            WHO IS BEHIND IT
          </p>
          <h2 className="font-['Bembo_Std'] text-3xl md:text-[40px] font-normal text-dark-charcoal leading-tight mb-4">
            Countries, Founders, & Partners Involved
          </h2>
          <p className="font-['Bembo_Std'] text-sm text-neutral-400 leading-relaxed max-w-3xl">
            Compiled from official announcements, press coverage, and public statements by the individuals and organizations named below.
          </p>
        </ScrollReveal>

        {/* Section 1: Countries Involved */}
        <ScrollReveal delay={80} direction="up" className="mb-16 space-y-6">
          <div className="flex items-center gap-2 text-dark-charcoal font-['Gotham'] text-xs uppercase tracking-wider font-semibold">
            <FiGlobe className="text-base text-neutral-400" />
            <span>Countries Involved</span>
          </div>

          <div className="flex flex-wrap gap-3">
            {countries.map((country) => (
              <span
                key={country}
                className="font-['Gotham'] text-[11px] font-medium text-dark-charcoal tracking-wider border border-zinc-200 px-4 py-2 rounded-full hover:border-khaki-gold hover:bg-zinc-50 transition-colors"
              >
                {country}
              </span>
            ))}
          </div>

          <p className="font-['Bembo_Std'] text-xs md:text-sm text-rich-black leading-relaxed max-w-5xl">
            The UK and Bangladesh host the Charter&apos;s confirmed launch and partnership activity. The remaining countries listed are major global tea producers that the mission concerns; a public 2025 statement by Dame Lauran Bush referred to active conversations in 17 further countries, which could not be independently itemised at the time of writing.
          </p>
        </ScrollReveal>

        {/* Section 2: Founders & Key People */}
        <ScrollReveal delay={160} direction="up" className="mb-16 space-y-8">
          <div className="flex items-center gap-2 text-dark-charcoal font-['Gotham'] text-xs uppercase tracking-wider font-semibold">
            <FiUsers className="text-base text-neutral-400" />
            <span>Founders & key people</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
            {founders.map((person, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200">
                  <FiUser className="text-neutral-400 text-lg" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-['Gotham'] text-xs font-semibold text-dark-charcoal uppercase tracking-wide">
                    {person.name}
                  </h4>
                  <p className="font-['Bembo_Std'] text-xs md:text-[13px] text-rich-black leading-relaxed">
                    {person.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Section 3: Partner & Endorsing Organizations */}
        <ScrollReveal delay={240} direction="up" className="space-y-8">
          <div className="flex items-center gap-2 text-dark-charcoal font-['Gotham'] text-xs uppercase tracking-wider font-semibold">
            <FiBriefcase className="text-base text-neutral-400" />
            <span>Partner & endorsing organizations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
            {organizations.map((org, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="font-['Gotham'] text-xs font-semibold text-dark-charcoal uppercase tracking-wide">
                  {org.name}
                </h4>
                <p className="font-['Gotham'] text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  {org.subtitle}
                </p>
                <p className="font-['Bembo_Std'] text-xs md:text-[13px] text-rich-black leading-relaxed">
                  {org.desc}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
