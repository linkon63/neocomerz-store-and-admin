import Bottomfooter from '@/components/sections/bottom-footer';
import Collection from '@/components/sections/collection';
import Experience from '@/components/sections/experience';
import Header from '@/components/sections/header';
import Hero from '@/components/sections/hero';
import Invitation from '@/components/sections/invitation';
import Mainfooter from '@/components/sections/main-footer';
import MostPopular from '@/components/sections/most-populer';
import NewArrivals from '@/components/sections/new-arrivals';
import TopHeader from '@/components/sections/top-header';

export default function Home() {
  return (
    <div>
      <TopHeader />
      <Header />
      <Hero />
      <Invitation />
      <Collection />
      <NewArrivals />
      <Experience />
      <MostPopular />
      <Mainfooter />
      <Bottomfooter />
    </div>
  );
}
