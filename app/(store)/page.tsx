import Hero from '@/components/sections/hero';
import Invitation from '@/components/sections/invitation';
import Presence from '@/components/sections/presence';
import Prestige from '@/components/sections/prestige';
import NewArrival from '@/components/sections/newarrival';
import Brands from '@/components/sections/brands';
import Instagram from '@/components/sections/instagram';
import Testimonial from '@/components/sections/testimonial';
import TeaCollection from '@/components/sections/ui/tea-collection';
import TeaLifestyle from '@/components/sections/tea-lifestyle';
import PresenceImage from '@/components/sections/ui/presence-image';
import NobleBalance from '@/components/sections/ui/noble-balance';
import WorldAssembly from '@/components/sections/ui/world-assembly';
import Subtract from '@/components/sections/subtract';
import LooseTea from '@/components/sections/ui/loose-tea';
import GiftItem from '@/components/sections/gift-item';
import MostPopuler from '@/components/sections/most-populer';
import TheCollection from '@/components/sections/the-collection';
import ScrollAnimate from '@/components/ui/scroll-animate';

export default function Home() {
  return (
    <div>
      <Hero />
      <ScrollAnimate variant="fade-in-up">
        <Invitation />
      </ScrollAnimate>
      <ScrollAnimate variant="fade-in-up">
        <TheCollection />
      </ScrollAnimate>
      <ScrollAnimate variant="fade-in-up">
        <NewArrival />
      </ScrollAnimate>
      <ScrollAnimate variant="fade-in-up">
        <LooseTea />
      </ScrollAnimate>
      <Subtract />
      <ScrollAnimate variant="fade-in-up">
        <MostPopuler />
      </ScrollAnimate>
      <ScrollAnimate variant="fade-in-up">
        <GiftItem />
      </ScrollAnimate>
      <ScrollAnimate variant="fade-in-up">
        <WorldAssembly />
      </ScrollAnimate>
      <ScrollAnimate variant="fade-in-up">
        <NobleBalance />
      </ScrollAnimate>
      <ScrollAnimate variant="fade-in-up">
        <PresenceImage />
      </ScrollAnimate>
      <ScrollAnimate variant="fade-in-up">
        <Presence />
      </ScrollAnimate>
      <ScrollAnimate variant="fade-in-up">
        <Prestige />
      </ScrollAnimate>
      <ScrollAnimate variant="fade-in-up">
        <TeaCollection />
      </ScrollAnimate>
      <ScrollAnimate variant="fade-in-up">
        <TeaLifestyle />
      </ScrollAnimate>
      <ScrollAnimate variant="fade-in-up">
        <Brands />
      </ScrollAnimate>
      <ScrollAnimate variant="fade-in-up">
        <Testimonial />
      </ScrollAnimate>
      <ScrollAnimate variant="fade-in-up">
        <Instagram />
      </ScrollAnimate>
    </div>
  );
}

