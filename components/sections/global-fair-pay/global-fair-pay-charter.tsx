import CharterHero from "@/components/sections/global-fair-pay/charter-hero";
import CharterIntro from "@/components/sections/global-fair-pay/charter-intro";
import CharterVideo from "@/components/sections/global-fair-pay/charter-video";
import CharterPrinciples from "@/components/sections/global-fair-pay/charter-principles";
import CharterStats from "@/components/sections/global-fair-pay/charter-stats";
import CharterPeople from "@/components/sections/global-fair-pay/charter-people";
import CharterTimeline from "@/components/sections/global-fair-pay/charter-timeline";
import CharterQuote from "@/components/sections/global-fair-pay/charter-quote";
import ScrollAnimate from "@/components/ui/scroll-animate";

export default function GlobalFairPayCharter() {
  return (
    <div className="bg-[#fbfbfa] min-h-screen overflow-clip">
      {/* 1. Hero / Header Area */}
      <ScrollAnimate variant="fade-in-up">
        <CharterHero />
      </ScrollAnimate>

      {/* 2. Impact Section */}
      <ScrollAnimate variant="fade-in-up">
        <CharterIntro />
      </ScrollAnimate>

      {/* 3. Video Introduction Section */}
      <ScrollAnimate variant="fade-in-up">
        <CharterVideo />
      </ScrollAnimate>

      {/* 4. Eight Articles Section */}
      <ScrollAnimate variant="fade-in-up">
        <CharterPrinciples />
      </ScrollAnimate>

      {/* 5. Metrics & Booklet Section */}
      <ScrollAnimate variant="fade-in-up">
        <CharterStats />
      </ScrollAnimate>

      {/* 6. Involved People & Organizations Section */}
      <ScrollAnimate variant="fade-in-up">
        <CharterPeople />
      </ScrollAnimate>

      {/* 7. History Timeline Section */}
      <ScrollAnimate variant="fade-in-up">
        <CharterTimeline />
      </ScrollAnimate>

      {/* 8. Mansion House Quote Section */}
      <ScrollAnimate variant="fade-in-up">
        <CharterQuote />
      </ScrollAnimate>
    </div>
  );
}
