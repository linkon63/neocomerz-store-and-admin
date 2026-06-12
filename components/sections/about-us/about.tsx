import Brands from '@/components/sections/brands';
import Instagram from '@/components/sections/instagram';
import Sustainable from '@/components/sections/sustainable';
import Quality from '@/components/sections/quality';
import TheBrands from '@/components/sections/ui/the-brands';
import Weoffer from '@/components/sections/ui/we-offer';
import AboutUs from '@/components/sections/ui/about-us';

export default function About() {
  return (
    <div>
      <AboutUs />
      <Weoffer />
      <TheBrands />
      <Quality />
      <Sustainable />
      <Brands />
      <Instagram />
    </div>
  );
}
