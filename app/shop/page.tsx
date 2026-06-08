import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiShoppingBag, FiUser } from "react-icons/fi";
import humanaLogo from "../../references/logo.png";
import ShopCatalog from "./shop-catalog";

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-white text-[#151515]">
      <section className="bg-black px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
        Join our community and get 10% off every piece
      </section>

      <header className="border-b border-neutral-100 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-8">
          <Link href="/" aria-label="Humana Vintage home">
            <Image src={humanaLogo} alt="Humana Vintage" priority className="h-9 w-auto sm:h-11" />
          </Link>

          <nav className="hidden items-center gap-7 text-[11px] font-semibold uppercase tracking-[0.08em] lg:flex">
            <Link href="/">Home</Link>
            <Link href="/shop">Shop</Link>
            <Link href="#">About Us</Link>
            <Link href="#">Donate</Link>
            <Link href="#">Contact</Link>
            <Link href="#">Log In</Link>
          </nav>

          <div className="flex items-center gap-4 border-l border-neutral-200 pl-5 text-lg">
            <FiHeart aria-label="Wishlist" />
            <FiUser aria-label="Account" />
            <div className="relative">
              <FiShoppingBag aria-label="Cart" />
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                0
              </span>
            </div>
          </div>
        </div>
      </header>

      <ShopCatalog />
    </main>
  );
}
