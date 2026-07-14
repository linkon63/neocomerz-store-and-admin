import Brands from '@/components/sections/brands';
import Instagram from '@/components/sections/instagram';
import Sustainable from '@/components/sections/sustainable';
import Quality from '@/components/sections/quality';
import TheBrands from '@/components/sections/ui/the-brands';
import Weoffer from '@/components/sections/ui/we-offer';
import AboutUs from '@/components/sections/ui/about-us';
import ScrollAnimate from '@/components/ui/scroll-animate';

export default function About() {
  return (
    <div>
      <ScrollAnimate variant="fade-in-up">
        <AboutUs />
      </ScrollAnimate>
      <ScrollAnimate variant="fade-in-up">
        <Weoffer />
      </ScrollAnimate>
      <ScrollAnimate variant="fade-in-up">
        <TheBrands />
      </ScrollAnimate>
      <ScrollAnimate variant="fade-in-up">
        <Quality />
      </ScrollAnimate>
      <ScrollAnimate variant="fade-in-up">
        <Sustainable />
      </ScrollAnimate>
      <ScrollAnimate variant="fade-in-up">
        <Brands />
      </ScrollAnimate>
      <ScrollAnimate variant="fade-in-up">
        <Instagram />
      </ScrollAnimate>
    </div>
  );
}
