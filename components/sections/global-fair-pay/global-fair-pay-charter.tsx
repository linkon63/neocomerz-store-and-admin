import CharterHero from "@/components/sections/global-fair-pay/charter-hero";
import CharterIntro from "@/components/sections/global-fair-pay/charter-intro";
import CharterVideo from "@/components/sections/global-fair-pay/charter-video";
import CharterPrinciples from "@/components/sections/global-fair-pay/charter-principles";
import CharterStats from "@/components/sections/global-fair-pay/charter-stats";
import CharterPeople from "@/components/sections/global-fair-pay/charter-people";
import CharterTimeline from "@/components/sections/global-fair-pay/charter-timeline";
import CharterQuote from "@/components/sections/global-fair-pay/charter-quote";

export default function GlobalFairPayCharter() {
  return (
    <div className="bg-[#fbfbfa] min-h-screen overflow-clip">
      {/* 1. Hero / Header Area */}
      <CharterHero />

      {/* 2. Impact Section */}
      <CharterIntro />

      {/* 3. Video Introduction Section */}
      <CharterVideo />

      {/* 4. Eight Articles Section */}
      <CharterPrinciples />

      {/* 5. Metrics & Booklet Section */}
      <CharterStats />

      {/* 6. Involved People & Organizations Section */}
      <CharterPeople />

      {/* 7. History Timeline Section */}
      <CharterTimeline />

      {/* 8. Mansion House Quote Section */}
      <CharterQuote />
    </div>
  );
}
