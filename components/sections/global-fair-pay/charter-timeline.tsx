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
    <section className="w-full bg-[#fbfbfa] py-20 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        {/* Subtitle & Title */}
        <div className="text-left mb-16">
          <p className="font-['Gotham'] text-xs uppercase tracking-[0.25em] text-neutral-400 mb-3">
            WHO IS BEHIND IT
          </p>
          <h2 className="font-['Bembo_Std'] text-3xl md:text-[40px] font-normal text-dark-charcoal leading-tight mb-4">
            How the Charter came to be
          </h2>
          <p className="font-['Bembo_Std'] text-[13px] text-neutral-400 leading-relaxed max-w-2xl">
            Assembled from public statements, press coverage, and official announcements. Dates marked &quot;as reported&quot; could not be independently cross-verified beyond a single source.
          </p>
        </div>

        {/* Vertical Timeline */}
        <div className="relative border-l border-zinc-200 ml-3 pl-8 space-y-12">
          {timelineEvents.map((event, idx) => (
            <div key={idx} className="relative group">
              {/* Gold marker dot */}
              <div className="absolute -left-[37px] top-1.5 w-4 h-4 rounded-full border-[3px] border-[#fbfbfa] bg-khaki-gold shadow-xs group-hover:scale-110 transition-transform duration-200" />

              {/* Event Content */}
              <div className="space-y-2">
                <p className="font-['Gotham'] text-[11px] font-medium tracking-[0.2em] text-neutral-400 uppercase">
                  {event.date}
                </p>
                <h3 className="font-['Bembo_Std'] text-lg md:text-xl font-normal text-dark-charcoal">
                  {event.title}
                </h3>
                <p className="font-['Bembo_Std'] text-sm md:text-[15px] text-rich-black leading-relaxed font-normal">
                  {event.description}
                </p>
                <p className="font-['Bembo_Std'] italic text-[11px] text-neutral-400">
                  {event.source}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
