import Brands from '@/components/sections/brands';
import Instagram from '@/components/sections/instagram';
import Sustainable from '@/components/sections/sustainable';
import Quality from '@/components/sections/quality';

export default function About() {
  return (
    <div>
      <Quality />
      <Sustainable />
      <Brands />
      <Instagram />
    </div>
  );
}
