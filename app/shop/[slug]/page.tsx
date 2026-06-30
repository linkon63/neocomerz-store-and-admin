import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaFacebookF, FaGooglePlusG, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { FiChevronLeft, FiChevronRight, FiHeart, FiMail, FiShoppingBag } from "react-icons/fi";
import { productSlug, shopProducts } from "../products";
import { PriceDisplay } from "../../_components/price-display";

export function generateStaticParams() {
  return shopProducts.map((product) => ({
    slug: productSlug(product),
  }));
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = shopProducts.find((item) => productSlug(item) === slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = shopProducts
    .filter((item) => item.name !== product.name)
    .slice(0, 5);
  const salePrice = product.price * 0.8;

  return (
    <main className="min-h-screen bg-white text-[#151515]">
      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.04em]">
          <Link href="/">Home</Link>
          <span>›</span>
          <Link href="/shop">Shop</Link>
          <span>›</span>
          <Link href="/shop">{product.category}</Link>
          <span>›</span>
          <span>{product.name}</span>
        </div>

        <h1 className="mt-4 text-3xl font-medium uppercase tracking-tight">
          {product.name}
        </h1>

        <div className="mt-5 grid gap-8 lg:grid-cols-[560px_1fr]">
          <section>
            <div className="relative aspect-square border border-neutral-100 bg-white">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover object-center p-12"
              />
            </div>

            <div className="mt-2 flex gap-2">
              {[product.image, product.image].map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={`relative h-24 w-24 border bg-white ${index === 0 ? "border-black" : "border-neutral-100"}`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    sizes="96px"
                    className={`object-cover p-3 ${index === 1 ? "scale-x-[-1]" : ""}`}
                  />
                </button>
              ))}
            </div>
          </section>

          <section className="pt-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black uppercase leading-tight">
                  {product.name}
                </h2>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-lg font-black text-neutral-400 line-through">
                    <PriceDisplay value={product.price} />
                  </span>
                  <span className="text-2xl font-black text-neutral-900">
                    <PriceDisplay value={salePrice} />
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200" type="button" aria-label="Previous product">
                  <FiChevronLeft />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200" type="button" aria-label="Next product">
                  <FiChevronRight />
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm leading-6 text-neutral-600">
              <p>
                <span className="font-black text-neutral-900">Availability:</span> Available
              </p>
              <p>
                <span className="font-black text-neutral-900">Code:</span> HV-{slug.slice(0, 10).toUpperCase()}
              </p>
              <p>
                <span className="font-black text-neutral-900">Tags:</span> Football clothing, historic jerseys,
                archive sportswear, iconic team pieces, vintage football
              </p>
            </div>

            <div className="mt-6 border-t border-neutral-200 pt-6">
              <button className="inline-flex items-center gap-3 bg-neutral-900 px-6 py-4 text-sm font-black uppercase text-white" type="button">
                <FiShoppingBag className="text-lg" />
                Add to cart
              </button>

              <button className="mt-6 block w-full bg-black px-6 py-4 text-center text-base font-bold text-white" type="button">
                Buy with Apple Pay
              </button>
              <button className="mt-4 block w-full bg-black px-6 py-3 text-center text-sm font-bold text-white" type="button">
                Google Pay &nbsp; | &nbsp; Card
              </button>

              <p className="mt-5 text-xs text-neutral-500">
                Pay in 3 interest-free installments. Powered by PayPal.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {[FaFacebookF, FaXTwitter, FaLinkedinIn, FaGooglePlusG, FiMail].map((Icon, index) => (
                  <button
                    key={index}
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-xs"
                    aria-label="Share product"
                  >
                    <Icon />
                  </button>
                ))}
                <button className="ml-1 inline-flex items-center gap-2 text-xs font-black uppercase" type="button">
                  <FiHeart className="text-lg" />
                  Add to wishlist
                </button>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-12">
          <h2 className="inline-block border-b border-black pb-3 text-xs font-black uppercase">
            Additional Information
          </h2>
          <div className="mt-8 border-t border-neutral-100 text-sm">
            <div className="grid grid-cols-[220px_1fr] border-b border-neutral-200 bg-neutral-50 px-3 py-4">
              <span className="font-black text-neutral-500">Color</span>
              <span>{product.color}</span>
            </div>
            <div className="grid grid-cols-[220px_1fr] border-b border-neutral-200 px-3 py-4">
              <span className="font-black text-neutral-500">Size</span>
              <span>{product.size}</span>
            </div>
            <div className="grid grid-cols-[220px_1fr] border-b border-neutral-200 bg-neutral-50 px-3 py-4">
              <span className="font-black text-neutral-500">Team</span>
              <span>{product.team}</span>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
            <h2 className="text-sm font-black uppercase">Related Products</h2>
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full border border-black" />
              <span className="h-2 w-2 rounded-full border border-neutral-300" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
            {relatedProducts.map((item) => (
              <article key={item.name} className="group">
                <Link href={`/shop/${productSlug(item)}`} className="block border border-neutral-100 bg-white">
                  <div className="relative aspect-square">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(min-width: 1024px) 20vw, 50vw"
                      className="object-cover object-center p-6 transition group-hover:scale-[1.03]"
                    />
                  </div>
                </Link>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-black uppercase text-neutral-400">
                      {item.category}, {item.team}
                    </p>
                    <h3 className="mt-1 truncate text-sm font-black uppercase text-neutral-800">
                      {item.name}
                    </h3>
                    <p className="mt-2 text-base font-black"><PriceDisplay value={item.price} /></p>
                  </div>
                  <FiHeart className="mt-1 shrink-0 text-lg text-neutral-600" />
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
