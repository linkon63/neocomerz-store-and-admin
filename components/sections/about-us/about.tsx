import Brands from '@/components/sections/brands';
import Instagram from '@/components/sections/instagram';
import Sustainable from '@/components/sections/sustainable';
import Quality from '@/components/sections/quality';
import TheBrands from '@/components/sections/ui/the-brands';

export default function About() {
  return (
    <div>
      <TheBrands />
      <Quality />
      <Sustainable />
      <Brands />
      <Instagram />
    </div>
  );
}
