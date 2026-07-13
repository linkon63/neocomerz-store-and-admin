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
    <section className="w-full bg-[#fbfbfa] pt-20 md:pt-32 lg:pt-44 pb-24 md:pb-36 lg:pb-48 px-6 md:px-12 lg:px-24 relative">
      <div className="max-w-7xl mx-auto">
        {/* Top Banner: Fairness, Equality, Justice */}
        <div className="flex flex-col items-center justify-center mb-16 text-center">
          <p className="font-['Bembo_Std'] text-[13px] md:text-[15px] font-normal tracking-[0.35em] text-neutral-400 uppercase mb-4">
            FAIRNESS &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; EQUALITY &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; JUSTICE
          </p>
          <div className="w-full flex items-center justify-center gap-4 max-w-xl">
            <div className="h-px bg-zinc-200 flex-1" />
            <img
              src="/images/icons/icon-3.svg"
              alt="Fleur-de-lis"
              className="w-[22px] h-[25px] object-contain grayscale opacity-60"
            />
            <div className="h-px bg-zinc-200 flex-1" />
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
          {/* Left Column: Heading and Info */}
          <div className="lg:col-span-5 lg:sticky lg:top-36 lg:h-fit space-y-8">
            <div className="self-stretch flex flex-col justify-start items-start gap-4 md:gap-6">
              <div className="text-neutral-400 text-base md:text-lg font-normal font-['Bembo_Std'] uppercase leading-6">
                The Charter
              </div>
              <h2 className="self-stretch justify-start text-neutral-600 text-4xl md:text-5xl lg:text-6xl font-normal font-['Bembo_Std'] leading-tight lg:leading-[56px]">
                Eight Articles, One Standard
              </h2>
              <div className="self-stretch justify-start text-zinc-600 text-base lg:text-lg font-normal font-['Bembo_Std'] leading-relaxed lg:leading-7">
                The Global Fair Pay Charter was established by the Fair Pay Foundation in 2024 and aligns itself with the United Nations Sustainable Development Goals. Signatories — companies, governments, and civic bodies — commit to all eight articles in full.
              </div>
            </div>

            <div className="flex flex-col justify-start items-start gap-3 w-full sm:w-auto">
              <a
                href="#"
                className="px-6 md:px-8 py-3.5 md:py-4 bg-white rounded-[100px] border border-neutral-600 inline-flex justify-center items-center hover:bg-neutral-800 hover:border-neutral-800 text-neutral-600 hover:text-white transition-all duration-300 text-xs md:text-sm lg:text-base font-medium font-['Gotham'] uppercase leading-tight tracking-wider w-full sm:w-auto text-center"
              >
                Download the official Charter (PDF)
              </a>
              <div className="justify-start text-neutral-400 text-[10px] md:text-xs font-medium font-['Gotham'] leading-4 pl-2">
                Source: Fair Pay Foundation, hosted via Long Finance
              </div>
            </div>
          </div>

          {/* Right Column: 8 Article Cards */}
          <div className="lg:col-span-7 space-y-4">
            {articles.map((art, idx) => (
              <div
                key={idx}
                className="self-stretch p-5 md:p-6 lg:p-8 bg-neutral-100 rounded-xl flex justify-start items-start gap-4 md:gap-6 hover:shadow-xs transition-shadow duration-200"
              >
                {/* Article Roman Number Block */}
                <div className="w-14 md:w-16 shrink-0 flex flex-col justify-start items-start gap-1 md:gap-2">
                  <div className="justify-start text-neutral-500 text-[10px] md:text-xs font-medium font-['Gotham'] leading-4">
                    Article.
                  </div>
                  <div className="justify-start text-neutral-800 text-2xl md:text-3xl lg:text-4xl font-normal font-['Bembo_Std'] leading-tight">
                    {art.roman}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-start items-start gap-1 md:gap-2">
                  <div className="justify-start text-neutral-800 text-base lg:text-lg font-normal font-['Bembo_Std'] uppercase leading-snug lg:leading-6">
                    {art.title}
                  </div>
                  <div className="self-stretch justify-start text-zinc-600 text-sm md:text-base lg:text-lg font-normal font-['Bembo_Std'] leading-relaxed lg:leading-7">
                    {art.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom curved shape */}
      <div className="absolute left-0 right-0 bottom-0 pointer-events-none z-10">
        <img
          src="/images/icons/bottom-shape.svg"
          alt=""
          className="w-full h-auto block"
        />
      </div>
    </section>
  );
}
