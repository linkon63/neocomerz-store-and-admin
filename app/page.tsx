import Bottomfooter from '@/components/sections/bottom-footer';
import Collection from '@/components/sections/collection';
import Header from '@/components/sections/header';
import Hero from '@/components/sections/hero';
import Invitation from '@/components/sections/invitation';
import Mainfooter from '@/components/sections/main-footer';
import OurStory from '@/components/sections/our-story';
import Philosophy from '@/components/sections/philosophy';
import Presence from '@/components/sections/presence';
import Prestige from '@/components/sections/prestige';
import NewArrivals from '@/components/sections/new-arrivals';
import TopHeader from '@/components/sections/top-header';
import Instagram from '@/components/sections/instagram';
import Brands from '@/components/sections/brands';

export default function Home() {
  return (
    <div>
      <TopHeader />
      <Header />
      <Philosophy />
      <OurStory />
      <Presence />
      <Prestige />
      <Brands />
      <Instagram />
      <Hero />
      <Invitation />
      <NewArrivals />
      <Collection />
      <Mainfooter />
      <Bottomfooter />
    </div>
  );
}
