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
              <div className="flex justify-between items-center gap-4 py-3">
                <Link
                  href="/collections/assorted"
                  className="bg-brand-primary text-white text-center py-4 px-6 font-bembo text-base uppercase tracking-wide hover:bg-opacity-90 transition-all"
                >
                  ASSORTED COLLECTIONS
                </Link>
                <div className="w-16 h-16 flex items-center justify-center relative">
                  <Image
                    src="/images/footer/footerrightlogo.png"
                    alt="London Tea Exchange Logo"
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <Link
                  href="/collections/tea-book"
                  className="bg-white text-text-primary text-center py-4 px-6 font-bembo text-base uppercase tracking-wide hover:bg-brand-3 hover:text-white transition-all"
                >
                  TEA BOOK COLLECTIONS
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
