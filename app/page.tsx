import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FiHeart, FiSearch, FiShoppingBag, FiUser } from "react-icons/fi";
import HeroSlider from "./_components/hero-slider";
import humanaLogo from "../references/logo.png";

const editorialImages = [
  {
    src: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1100&q=85",
    label: "SHOP WOMENSWEAR",
  },
  {
    src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1100&q=85",
    label: "SHOP MENSWEAR",
  },
];

const products = [
  {
    name: "Adidas Bayern Munich home shirt",
    color: "Red",
    price: "EUR 89.00",
    image:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Nike archive warm-up jacket",
    color: "Black",
    price: "EUR 129.00",
    image:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Vintage football training top",
    color: "Yellow",
    price: "EUR 69.00",
    image:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Classic striped match jersey",
    color: "Blue",
    price: "EUR 74.00",
    image:
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Retro track jacket",
    color: "Green",
    price: "EUR 98.00",
    image:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=85",
  },
];

const newsImage =
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1800&q=85";

const footerGroups = [
  {
    title: "Customer Service",
    links: [
      "FAQ",
      "Terms & Conditions",
      "Terms & Conditions Store",
      "Shipping & Delivery",
      "Login",
      "Wishlist",
    ],
  },
  {
    title: "Who We Are",
    links: ["Who We Are", "Contacts", "Our Stores", "Institutional Blog"],
  },
  {
    title: "More Information",
    links: ["Privacy", "Cookie Policy", "Info and Returns", "Refunds"],
  },
];

const paymentMethods = ["VISA", "PayPal", "stripe", "VeriSign"];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#151515]">
      <section className="bg-black px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
        Free shipping on all orders over EUR 150
      </section>

      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <nav className="hidden items-center gap-7 text-[11px] font-semibold uppercase tracking-[0.08em] lg:flex">
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

          {/* <Link
            href="/shop"
            className="hidden min-w-[220px] items-center gap-2 border-b border-black pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] xl:flex"
          >
            <FiSearch className="text-sm" />
            <span>Football jerseys</span>
          </Link> */}

          <div className="hidden items-center gap-5 text-lg text-black lg:flex">
            <FiSearch aria-label="Search" />
            <FiUser aria-label="Account" />
            <FiHeart aria-label="Wishlist" />
            <FiShoppingBag aria-label="Cart" />
          </div>
        </div>

        <div className="border-t border-neutral-200 px-4 py-2 xl:hidden">
          <Link href="/shop" className="mx-auto flex max-w-[520px] items-center gap-2 border-b border-black pb-1 text-[11px] uppercase tracking-[0.08em]">
            <FiSearch className="text-sm" />
            <span>Football jerseys</span>
          </Link>
        </div>
      </header>

      <HeroSlider />

      <section className="mx-auto max-w-[1400px]">
        <div className="grid gap-2 pt-2 md:grid-cols-2">
          {editorialImages.map((item) => (
            <Link key={item.label} href="#" className="group relative block h-[520px] overflow-hidden">
              <Image
                src={item.src}
                alt={item.label}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-8">
        <h1 className="font-bembo text-2xl font-bold sm:text-3xl">
          Thousands of different stories
        </h1>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
          {products.map((product) => (
            <article key={product.name} className="group">
              <Link href="#" className="block bg-neutral-50">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
              </Link>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase leading-4 tracking-[0.08em]">
                    {product.name}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-neutral-500">
                    {product.color}
                  </p>
                  <p className="mt-2 text-xs font-semibold">{product.price}</p>
                </div>
                <FiHeart className="mt-0.5 shrink-0 text-sm" aria-label="Add to wishlist" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#ffd3f3] px-4 py-14 text-center sm:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em]">The brand</p>
        <h2 className="mt-4 font-bembo text-3xl font-bold sm:text-4xl">
          Experience our quality firsthand
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6">
          Every piece is selected for character, condition, and the story it carries.
          Discover expressive vintage staples made for everyday wear.
        </p>
        <Link
          href="#"
          className="mt-7 inline-flex bg-black px-6 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
        >
          See the story
        </Link>
      </section>

      <section>
        <div className="relative h-[460px] overflow-hidden sm:h-[560px]">
          <Image
            src={newsImage}
            alt="Community fashion story"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-6 pb-12 pt-28 text-white sm:px-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]">Journal</p>
            <h2 className="mt-3 max-w-3xl font-bembo text-4xl font-bold leading-none sm:text-6xl">
              Small gestures that transform the world
            </h2>
          </div>
        </div>

        <div className="mx-auto max-w-[1480px] px-6 pb-44 pt-18 sm:px-10 lg:px-16 lg:pb-56 lg:pt-24">
          <p className="text-sm font-bold uppercase tracking-normal">News</p>
          <h2 className="mt-7 font-bembo text-4xl font-bold leading-tight text-black sm:text-6xl lg:text-7xl">
            Cosa accade nel mondo di Humana Vintage
          </h2>
        </div>
      </section>

      <section className="bg-[#ffd02f] px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-[1480px] gap-10 lg:grid-cols-[1fr_520px] lg:items-center">
          <div>
            <h2 className="font-bembo text-4xl font-bold leading-tight text-black sm:text-6xl lg:text-7xl">
              Iscriviti alla nostra Newsletter
            </h2>
            <p className="mt-7 text-xl font-medium text-black sm:text-2xl">
              Resta sempre aggiornato e ricevi subito il 10% di sconto
            </p>
          </div>
          <div>
            <form className="flex w-full">
              <input
                type="email"
                placeholder="Inserisci la tua email"
                className="min-w-0 flex-1 bg-white px-5 py-4 text-lg font-medium text-neutral-900 outline-none placeholder:text-neutral-500"
              />
              <button
                type="submit"
                className="bg-[#120b16] px-6 py-4 text-xl font-medium uppercase text-white"
              >
                Iscriviti
              </button>
            </form>

            <label className="mt-8 flex items-center gap-3 text-xl font-bold text-black">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border border-neutral-400 bg-white"
              />
              <span>Ho letto e accetto i termini e le condizioni</span>
            </label>
          </div>
        </div>
      </section>

      <footer className="bg-white px-4 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1.2fr_1fr]">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h2 className="text-sm font-bold uppercase tracking-[0.02em] text-neutral-900">
                  {group.title}
                </h2>
                <ul className="mt-5 space-y-2">
                  {group.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-sm font-medium uppercase leading-5 text-neutral-400 transition hover:text-neutral-900 sm:text-base"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.02em] text-neutral-900">
                Social Media
              </h2>
              <div className="mt-5 flex gap-3">
                <Link
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-neutral-900 transition hover:border-neutral-900"
                  aria-label="Facebook"
                >
                  <FaFacebookF className="text-sm" />
                </Link>
                <Link
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-neutral-900 transition hover:border-neutral-900"
                  aria-label="Instagram"
                >
                  <FaInstagram className="text-base" />
                </Link>
              </div>

              <h2 className="mt-9 text-sm font-bold uppercase tracking-[0.02em] text-neutral-900">
                Payment Methods
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <span
                    key={method}
                    className="inline-flex h-8 items-center rounded bg-neutral-800 px-3 text-sm font-black text-white"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-neutral-300 pt-10 text-xs font-medium text-neutral-400">
            © 2026 Humana Vintage Italia | Powered by LikeYou Srl .
          </div>
        </div>
      </footer>
    </main>
  );
}
