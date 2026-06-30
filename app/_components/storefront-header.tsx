import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiSearch, FiShoppingBag, FiUser } from "react-icons/fi";
import humanaLogo from "../../references/logo.png";

export default function StorefrontHeader() {
  return (
    <>
      <section className="bg-black px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
        Join our community and get 10% off every piece
      </section>

      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <nav className="hidden items-center gap-7 text-[11px] font-semibold uppercase tracking-[0.08em] lg:flex">
            <Link href="/">Home</Link>
            <Link href="/shop">Shop</Link>
            <Link href="#">New In</Link>
            <Link href="#">Brands</Link>
            <Link href="#">Archive</Link>
          </nav>

          <Link href="/" className="mx-auto lg:mx-0" aria-label="Humana Vintage home">
            <Image
              src={humanaLogo}
              alt="Humana Vintage"
              priority
              className="h-9 w-auto sm:h-11"
            />
          </Link>

          <Link
            href="/shop"
            className="hidden min-w-[220px] items-center gap-2 border-b border-black pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] xl:flex"
          >
            <FiSearch className="text-sm" />
            <span>Football jerseys</span>
          </Link>

          <div className="hidden items-center gap-5 text-lg text-black lg:flex">
            <Link href="/profile" aria-label="Profile">
              <FiUser />
            </Link>
            <Link href="/wishlist" aria-label="Wishlist">
              <FiHeart />
            </Link>
            <Link href="/cart" aria-label="Cart" className="relative">
              <FiShoppingBag />
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                0
              </span>
            </Link>
          </div>
        </div>

        <div className="border-t border-neutral-200 px-4 py-2 xl:hidden">
          <Link
            href="/shop"
            className="mx-auto flex max-w-[520px] items-center gap-2 border-b border-black pb-1 text-[11px] uppercase tracking-[0.08em]"
          >
            <FiSearch className="text-sm" />
            <span>Football jerseys</span>
          </Link>
        </div>
      </header>
    </>
  );
}
