import Bottomfooter from '@/components/sections/bottom-footer';
import Header from '@/components/sections/header';
import Hero from '@/components/sections/hero';
import Invitation from '@/components/sections/invitation';
import Mainfooter from '@/components/sections/main-footer';
import TopHeader from '@/components/sections/top-header';

export default function Home() {
  return (
    <div>
      <TopHeader />
      <Header />
      <Hero />
      <Invitation />
      <Mainfooter />
      <Bottomfooter />
    </div>
  );
}
