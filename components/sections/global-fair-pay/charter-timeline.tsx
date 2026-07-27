import ScrollReveal from "@/components/ui/scroll-reveal";

const timelineEvents = [
  {
    date: "1999",
    title: "First plantation visits",
    description: "Sheikh Aliur Rahman visits tea estates and begins forming the fair-pay thinking that would later become the Charter.",
    source: "Source: AP Multimedia Newsroom, May 2024"
  },
  {
    date: "2000s–2023",
    title: "A fair-pay programme takes shape",
    description: "The idea develops within London Tea Exchange's own sourcing practice, ahead of any formal charter or foundation.",
    source: "Source: FS Club / Zyen event notes"
  },
  {
    date: "21 NOV 2023",
    title: "Early launch event, 66 Portland Place",
    description: "An initial event at RIBA's Florence Hall, with architect Lord Norman Foster speaking on sustainable cities, positions the Charter as part of a bid for London to become a \"fair pay city.\"",
    source: "Source: FA Lite; Prestige Events Magazine (event date as reported)"
  },
  {
    date: "22 MAY 2024",
    title: "Official launch at Mansion House",
    description: "On International Tea Day, the Global Fair Pay Charter is formally launched at Mansion House, London. Signed by Commonwealth Secretary-General the Rt Hon Patricia Scotland and Mayor of London Sadiq Khan; the City of London is represented by Lord Mayor Professor Michael Mainelli.",
    source: "Source: AP Multimedia Newsroom; Prof. Michael Mainelli's public post, May 2024"
  },
  {
    date: "30 MAY 2024",
    title: "UNITAR signs, Fair Pay Foundation launches",
    description: "In Geneva, UNITAR formally signs the Charter, launching the Fair Pay Foundation with a stated goal of lifting at least 3 million tea workers out of extreme poverty by 2030. Plans are announced for a UNITAR-affiliated CIFAL training centre in Bangladesh and a joint programme of \"Model Tea Plantations\" with London Tea Exchange.",
    source: "Source: UNITAR official news release, 30 May 2024"
  },
  {
    date: "2025",
    title: "Regional expansion and the Oxford Tea Collection",
    description: "A signing ceremony with Oxfam Bangladesh takes place at Oxford. In May 2025, London Tea Exchange launches the Oxford Tea Collection, described as the first tea brand built around Fair Pay sourcing. A follow-up London event marks twelve months of the Charter, with UNITAR's Asia-Pacific ambassador citing wider regional engagement and, separately, self-reported claims of millions of workers already benefiting — figures that vary between speakers and have not been independently audited.",
    source: "Source: Macau Business, 25 May 2025; Dame Lauran Bush, public statements"
  },
  {
    date: "21–22 MAY 2026",
    title: "International Tea Day & Fair Pay Charter Gala",
    description: "London Tea Exchange marks International Tea Day with a Fair Pay Charter Gala, alongside a commemoration linked to Catherine of Braganza's role in popularising tea in Britain.",
    source: "Source: Sheikh Aliur Rahman OBE, public statements, 2026"
  }
];

export default function CharterTimeline() {
  return (
    <section className="w-full bg-[#F6F6F6] py-28 md:py-36 px-6 md:px-12 relative overflow-hidden">
      {/* Top curved shape transition */}
      <div className="absolute left-0 right-0 top-0 -mt-[1px] pointer-events-none z-10">
        <svg width="1920" height="94" viewBox="0 0 1920 94" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
          <path d="M1920 0H0C0 0 429.807 94 960 94C1490.19 94 1920 0 1920 0Z" fill="#ffffff"/>
        </svg>
      </div>

      <div className="max-w-3xl mx-auto relative z-20">
        {/* Subtitle & Title */}
        <ScrollReveal delay={0} direction="up" className="text-left mb-16 space-y-2">
          <p className="font-['Gotham'] text-xs uppercase tracking-[0.25em] text-neutral-400">
            WHO IS BEHIND IT
          </p>
          <h2 className="font-['Bembo_Std'] text-3xl md:text-5xl font-normal text-dark-charcoal leading-tight">
            How the Charter came to be
          </h2>
          <p className="font-['Bembo_Std'] text-xs md:text-sm text-neutral-400 leading-relaxed max-w-2xl pt-1">
            Assembled from public statements, press coverage, and official announcements. Dates marked &quot;as reported&quot; could not be independently cross-verified beyond a single source.
          </p>
        </ScrollReveal>

        {/* Vertical Timeline */}
        <div className="relative border-l border-[#C5A880]/30 ml-4 pl-8 space-y-12">
          {timelineEvents.map((event, idx) => (
            <ScrollReveal
              key={idx}
              delay={idx * 80}
              direction="up"
             
             
            >
              <div className="relative group">
                {/* Gold Ring Marker Dot (matches Red Box in reference image) */}
                <div className="absolute -left-[43px] top-0.5 w-5 h-5 rounded-full border border-[#C5A880] bg-[#F6F6F6] flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform duration-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                </div>

                {/* Inline Date (matches Blue Box in reference image) */}
                <div className="flex items-center gap-3">
                  <p className="font-['Gotham'] text-xs font-medium tracking-[0.1em] text-neutral-400">
                    {event.date}
                  </p>
                </div>

                {/* Event Content */}
                <div className="space-y-1.5 mt-2">
                  <h3 className="font-['Bembo_Std'] text-lg md:text-xl font-normal text-dark-charcoal">
                    {event.title}
                  </h3>
                  <p className="font-['Bembo_Std'] text-sm md:text-[15px] text-neutral-600 leading-relaxed font-normal">
                    {event.description}
                  </p>
                  <p className="font-['Bembo_Std'] italic text-xs text-neutral-400 underline underline-offset-2">
                    {event.source}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

    </section>
  );
}
