import Image from "next/image";
import Link from "next/link";

export default function CollectionBanner() {
  return (
    <section className="w-full py-0">
      <div className="CollectionBanner-wrapper">
        <div className="container mx-auto">
          <div className="relative w-full h-96 overflow-hidden shadow-xl">
            <Image
              src="/images/footer/footerright.png"
              alt="Tea Collections"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/50"></div>
            <div className="absolute inset-0 flex flex-col py-8">
              <div className="flex justify-center">
                <h3 className="font-bembo text-white text-2xl uppercase tracking-widest">
                  THE COLLECTIONS
                </h3>
              </div>
              <div className="flex flex-col lg:flex-row justify-center items-center gap-4 py-3 px-4">
                <Link
                  href="/collections/assorted"
                  className="bg-brand-primary text-white text-center py-3 px-5 font-bembo text-sm uppercase tracking-wide hover:bg-opacity-90 transition-all min-w-[170px]"
                >
                  ASSORTED COLLECTIONS
                </Link>
                <div className="w-12 h-12 flex items-center justify-center relative shrink-0">
                  <Image
                    src="/images/footer/footerrightlogo.png"
                    alt="London Tea Exchange Logo"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <Link
                  href="/collections/tea-book"
                  className="bg-white text-text-primary text-center py-3 px-5 font-bembo text-sm uppercase tracking-wide hover:bg-brand-3 hover:text-white transition-all min-w-[170px]"
                >
                  TEA BOOK COLLECTIONS
                </Link>
                <Link
                  href="/collections/tea-chests"
                  className="bg-white text-text-primary text-center py-3 px-5 font-bembo text-sm uppercase tracking-wide hover:bg-brand-3 hover:text-white transition-all min-w-[170px]"
                >
                  TEA CHESTS
                </Link>
              </div>
              <div className="flex justify-center px-6">
                <p className="text-white text-center text-sm font-gotham leading-relaxed max-w-3xl">
                  Elegant tea bag presentations featuring rare blends, royal
                  infusions, wellness selections, and timeless classics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
