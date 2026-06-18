import Collection from '@/components/sections/collection';
import Hero from '@/components/sections/hero';
import Invitation from '@/components/sections/invitation';
import Philosophy from '@/components/sections/philosophy';
import Presence from '@/components/sections/presence';
import Prestige from '@/components/sections/prestige';
import NewArrival from '@/components/sections/newarrival';
import Brands from '@/components/sections/brands';
import Instagram from '@/components/sections/instagram';
import Testimonial from '@/components/sections/testimonial';
import TeaCollection from '@/components/sections/ui/tea-collection';
import PresenceImage from '@/components/sections/ui/presence-image';
import NobleBalance from '@/components/sections/ui/noble-balance';
import WorldAssembly from '@/components/sections/ui/world-assembly';
import Subtract from '@/components/sections/subtract';
import LooseTea from '@/components/sections/ui/loose-tea';

export default function Home() {
  return (
    <div>
      <Hero />
      <Invitation />
      <LooseTea />
      <Subtract />
      <NewArrival />
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
