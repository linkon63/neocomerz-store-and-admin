import Image from 'next/image';
import Link from 'next/link';
import Bottomfooter from '@/components/sections/bottom-footer';
import Header from '@/components/sections/header';
import Mainfooter from '@/components/sections/main-footer';
import TopHeader from '@/components/sections/top-header';
import RelatedCarousel from '@/components/sections/ui/related-carousel';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <TopHeader />
      <Header />

      <main className="flex-grow w-full">
        {/* Hero Banner Section */}
        <section className="relative w-full h-[500px] sm:h-[600px] flex items-center justify-center overflow-hidden">
          <Image
            src="/images/footer/footerright.png"
            alt="London Tea Exchange Hero"
            fill
            priority
            className="object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-4 sm:gap-6">
            <span className="font-gotham text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-[#C29D59]">
              ESTABLISHED IN LONDON
            </span>
            <h1 className="font-bembo text-white text-4xl sm:text-6xl lg:text-7xl font-normal leading-tight tracking-wide">
              London Tea Exchange
            </h1>
            <p className="font-bembo text-base sm:text-xl text-stone-300 max-w-2xl leading-relaxed">
              Purveyor of direct trade, organic teas from off the beaten path. Handpicked from remote mountain gardens for noble quality.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <Link
                href="/products"
                className="px-8 sm:px-10 py-4 bg-brand-primary hover:bg-opacity-90 text-white font-gotham text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] rounded-full transition-all duration-300 cursor-pointer shadow-md"
              >
                EXPLORE COLLECTIONS
              </Link>
              <Link
                href="/products"
                className="px-8 sm:px-10 py-4 border border-white hover:bg-white hover:text-stone-900 text-white font-gotham text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] rounded-full transition-all duration-300 cursor-pointer"
              >
                ROYAL EDITIONS
              </Link>
            </div>
          </div>
        </section>

        {/* Heritage Story Section */}
        <section className="w-full bg-[#F9F9FB] py-16 sm:py-24 border-t border-b border-stone-100">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20 text-center flex flex-col items-center gap-6">
            <div className="w-12 h-12 relative">
              <Image
                src="/images/footer/footerrightlogo.png"
                alt="London Tea Exchange Logo"
                fill
                className="object-contain"
              />
            </div>
            <h2 className="font-bembo text-3xl sm:text-4xl text-[#C29D59] font-normal tracking-wide">
              A Heritage of Noble Balance
            </h2>
            <p className="font-bembo text-base sm:text-lg text-stone-700 max-w-3xl leading-relaxed">
              From ancient mountain slopes to royal tea chambers, our selections are gathered with the utmost reverence for quality and fair trade. Every blend tells a story of balance, richness, and craftsmanship.
            </p>
          </div>
        </section>

        {/* Curated Grid Section */}
        <section className="w-full bg-white py-16 sm:py-24">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <div className="text-center mb-12 sm:mb-16 flex flex-col gap-3">
              <span className="font-gotham text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C29D59]">
                CURATED SELECTIONS
              </span>
              <h2 className="font-bembo text-3xl sm:text-4xl text-stone-850 font-normal tracking-wide">
                Our Signature Collections
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
              {/* Card 1: Tea Books */}
              <div className="group relative overflow-hidden bg-stone-100 border border-stone-100 flex flex-col justify-end p-8 min-h-[420px] sm:min-h-[480px]">
                <Image
                  src="/images/products/product-4.webp"
                  alt="Tea Books Collection"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent"></div>
                <div className="relative z-10 flex flex-col gap-3">
                  <h3 className="font-bembo text-white text-2xl font-normal tracking-wide">
                    Tea Books Collection
                  </h3>
                  <p className="font-bembo text-sm text-stone-300 leading-relaxed">
                    Exquisite velvet-bound cases housing loose-leaf treasures.
                  </p>
                  <Link
                    href="/products"
                    className="mt-2 font-gotham text-[10px] font-semibold uppercase tracking-wider text-[#C29D59] hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    EXPLORE COLLECTION &rarr;
                  </Link>
                </div>
              </div>

              {/* Card 2: Classic Collections */}
              <div className="group relative overflow-hidden bg-stone-100 border border-stone-100 flex flex-col justify-end p-8 min-h-[420px] sm:min-h-[480px]">
                <Image
                  src="/images/products/product-3.webp"
                  alt="Classic Collections"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent"></div>
                <div className="relative z-10 flex flex-col gap-3">
                  <h3 className="font-bembo text-white text-2xl font-normal tracking-wide">
                    Classic Collections
                  </h3>
                  <p className="font-bembo text-sm text-stone-300 leading-relaxed">
                    Traditional robust black teas from the premier gardens of Sylhet.
                  </p>
                  <Link
                    href="/products"
                    className="mt-2 font-gotham text-[10px] font-semibold uppercase tracking-wider text-[#C29D59] hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    EXPLORE COLLECTION &rarr;
                  </Link>
                </div>
              </div>

              {/* Card 3: Royal Collections */}
              <div className="group relative overflow-hidden bg-stone-100 border border-stone-100 flex flex-col justify-end p-8 min-h-[420px] sm:min-h-[480px]">
                <Image
                  src="/images/products/product-6.webp"
                  alt="Royal Collections"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent"></div>
                <div className="relative z-10 flex flex-col gap-3">
                  <h3 className="font-bembo text-white text-2xl font-normal tracking-wide">
                    Royal Collections
                  </h3>
                  <p className="font-bembo text-sm text-stone-300 leading-relaxed">
                    Rare yellow and green infusions initially reserved for royalty.
                  </p>
                  <Link
                    href="/products"
                    className="mt-2 font-gotham text-[10px] font-semibold uppercase tracking-wider text-[#C29D59] hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    EXPLORE COLLECTION &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Most Popular Carousel */}
        <RelatedCarousel />
      </main>

      <Mainfooter />
      <Bottomfooter />
    </div>
  );
}
