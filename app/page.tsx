import Collection from '@/components/sections/collection';
import Header from '@/components/sections/header';
import Hero from '@/components/sections/hero';
import Invitation from '@/components/sections/invitation';
import Philosophy from '@/components/sections/philosophy';
import OurStory from '@/components/sections/our-story';
import Presence from '@/components/sections/presence';
import Prestige from '@/components/sections/prestige';
import NewArrivals from '@/components/sections/new-arrivals';
import TopHeader from '@/components/sections/top-header';
import Brands from '@/components/sections/brands';
import Instagram from '@/components/sections/instagram';

export default function Home() {
  return (
    <div>
      <TopHeader />
      <Header />
      <Hero />
      <Invitation />
      <NewArrivals />
      <Collection />
      <Philosophy />
      <OurStory />
      <Presence />
      <Prestige />
      <Brands />
      <Instagram />
    </div>
  );
}
