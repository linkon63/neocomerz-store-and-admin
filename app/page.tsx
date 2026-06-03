import Bottomfooter from '@/components/sections/bottom-footer';
import Header from '@/components/sections/header';
import Mainfooter from '@/components/sections/main-footer';
import TopHeader from '@/components/sections/top-header';
import ProductDetails from '@/components/sections/product-details';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopHeader />
      <Header />
      <ProductDetails />
      <Mainfooter />
      <Bottomfooter />
    </div>
  );
}
