const articles = [
  {
    roman: "I",
    title: "FAIR REMUNERATION",
    desc: "Pay reflects the skill, effort, and responsibility of the role. Equal work is rewarded with equal pay, regardless of gender, ethnicity, religion, nationality, or age."
  },
  {
    roman: "II",
    title: "LIVING WAGE COMMITMENT",
    desc: "Wages should stretch beyond bare survival — covering food, water, housing, education, healthcare, transport, clothing, and a cushion for the unexpected."
  },
  {
    roman: "III",
    title: "CYCLICAL REVIEW OF WAGES",
    desc: "The Fair Pay Foundation works with governments and industry to review pay on a regular cycle, adjusting for cost of living and inflation, with the process kept transparent."
  },
  {
    roman: "IV",
    title: "EQUAL OPPORTUNITIES",
    desc: "No worker is shut out of benefits, training, or promotion on the basis of gender, race, religion, or disability."
  },
  {
    roman: "V",
    title: "FREEDOM OF ASSOCIATION",
    desc: "Workers retain the right to form and join trade unions of their choosing, to bargain collectively, and to assemble peacefully over their working conditions."
  },
  {
    roman: "VI",
    title: "HEALTH AND SAFETY",
    desc: "Working and living environments are held to local and international safety standards, treated as central to the Charter rather than an afterthought."
  },
  {
    roman: "VII",
    title: "CHILD LABOUR AND FORCED LABOUR",
    desc: "Both are rejected without exception, in line with International Labour Organisation standards on minimum working age and forced labour."
  },
  {
    roman: "VIII",
    title: "ENVIRONMENTAL SUSTAINABILITY",
    desc: "Signatories commit to responsible resource use, biodiversity protection, and sustainable agricultural practice — including renewable energy and water conservation."
  }
];

export default function CharterPrinciples() {
  return (
    <section className="w-full bg-[#fbfbfa] py-20 px-6 md:px-12 lg:px-24 border-t border-zinc-100">
      <div className="max-w-7xl mx-auto">
        {/* Top Banner: Fairness, Equality, Justice */}
        <div className="flex flex-col items-center justify-center mb-16 text-center">
          <p className="font-gotham text-xs font-semibold tracking-[0.3em] text-[#999999] uppercase mb-4">
            FAIRNESS &nbsp;•&nbsp; EQUALITY &nbsp;•&nbsp; JUSTICE
          </p>
          <div className="w-full flex items-center justify-center gap-6 max-w-lg">
            <div className="h-px bg-zinc-200 flex-1" />
            <img
              src="/images/icons/icon-3.svg"
              alt="Fleur-de-lis"
              className="w-4 h-4 object-contain opacity-50"
            />
            <div className="h-px bg-zinc-200 flex-1" />
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Heading and Info */}
          <div className="lg:col-span-5 space-y-8 sticky top-32">
            <div>
              <p className="font-gotham text-xs uppercase tracking-[0.25em] text-[#999999] mb-3">
                THE CHARTER
              </p>
              <h2 className="font-bembo text-3xl md:text-[44px] font-normal text-[#212721] leading-tight">
                Eight Articles, One Standard
              </h2>
            </div>

            <p className="font-bembo text-sm md:text-[15px] text-[#665a5d] leading-relaxed">
              The Global Fair Pay Charter was established by the Fair Pay Foundation in 2024 and aligns itself with the United Nations Sustainable Development Goals. Signatories — companies, governments, and civic bodies — commit to all eight articles in full.
            </p>

            <div className="pt-4 space-y-2">
              <a
                href="#"
                className="inline-block font-gotham text-[11px] font-semibold uppercase tracking-wider text-[#212721] border border-zinc-400 rounded-full px-8 py-3.5 hover:bg-[#212721] hover:text-white transition-colors duration-300"
              >
                DOWNLOAD THE OFFICIAL CHARTER (PDF)
              </a>
              <p className="font-bembo italic text-[11px] text-[#999999] pl-2">
                Source: Fair Pay Foundation, hosted via Long Finance
              </p>
            </div>
          </div>

          {/* Right Column: 8 Article Cards */}
          <div className="lg:col-span-7 space-y-4">
            {articles.map((art, idx) => (
              <div
                key={idx}
                className="bg-zinc-50/75 border border-zinc-200/60 rounded-lg p-6 md:p-8 flex flex-col md:flex-row items-start gap-4 md:gap-6 hover:shadow-xs transition-shadow duration-200"
              >
                {/* Article Roman Number Block */}
                <div className="min-w-[80px] shrink-0">
                  <span className="font-bembo text-[11px] text-zinc-400 uppercase tracking-widest block">
                    Article.
                  </span>
                  <span className="font-bembo text-xl md:text-2xl text-zinc-950 font-normal leading-none">
                    {art.roman}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <h4 className="font-gotham text-xs font-semibold text-zinc-900 uppercase tracking-wide">
                    {art.title}
                  </h4>
                  <p className="font-bembo text-xs md:text-[13px] text-[#665a5d] leading-relaxed">
                    {art.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
