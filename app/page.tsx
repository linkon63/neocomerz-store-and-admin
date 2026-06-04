import Bottomfooter from '@/components/sections/bottom-footer';
import Header from '@/components/sections/header';
import Mainfooter from '@/components/sections/main-footer';
import OurStory from '@/components/sections/our-story';
import Philosophy from '@/components/sections/philosophy';
import Presence from '@/components/sections/presence';
import Prestige from '@/components/sections/prestige';
import TopHeader from '@/components/sections/top-header';

export default function Home() {
  return (
    <div>
      <TopHeader />
      <Header />
      <Philosophy />
      <OurStory />
      <Presence/>
      <Prestige/>
      <Mainfooter />
      <Bottomfooter />
    </div>
  );
}
