import Collection from '@/components/sections/collection';
import Hero from '@/components/sections/hero';
import Invitation from '@/components/sections/invitation';
import Philosophy from '@/components/sections/philosophy';
import OurStory from '@/components/sections/our-story';
import Presence from '@/components/sections/presence';
import Prestige from '@/components/sections/prestige';
import NewArrivals from '@/components/sections/new-arrivals';
import Brands from '@/components/sections/brands';
import Instagram from '@/components/sections/instagram';
import Testimonial from '@/components/sections/testimonial';
import TeaCollection from '@/components/sections/ui/tea-collection';
import PresenceImage from '@/components/sections/ui/presence-image';
import NobleBalance from '@/components/sections/ui/noble-balance';
import WorldAssembly from '@/components/sections/ui/world-assembly';

export default function Home() {
  return (
    <div>
      <Hero />
      <Invitation />
      <NewArrivals />
      <Collection />
      <Philosophy />
      <WorldAssembly />
      <NobleBalance />
      <PresenceImage />
      <Presence />
      <Prestige />
      <TeaCollection />
      <Brands />
      <Testimonial />
      <Instagram />
    </div>
  );
}
