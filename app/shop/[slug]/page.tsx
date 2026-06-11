import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaFacebookF, FaGooglePlusG, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { FiChevronLeft, FiChevronRight, FiHeart, FiMail } from "react-icons/fi";
import { productSlug, resolveImageUrl, type DBProduct, type ProductVariant, type ProductMedia } from "../products";
import ProductPurchasePanel from "./product-purchase-panel";
import ProductImageGallery from "./product-image-gallery";
import WishlistButton from "./wishlist-button";

export const metadata = {
  title: process.env.SHOP_NAME 
    ? `Shop | ${process.env.SHOP_NAME}` 
    : "Shop",
  description: process.env.SHOP_DESCRIPTION || "Discover our curated collection of unique products and treasures.",
};

function formatPrice(price: number) {
  return `€${price.toFixed(2)}`;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5010/api/v1";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let dbProduct: DBProduct | null = null;
  try {
    const res = await fetch(`${BASE_URL}/products/slug/${slug}`, { cache: "no-store" });
    if (res.ok) {
      dbProduct = await res.json();
    }
  } catch (err) {
    console.error("Error fetching product by slug:", err);
  }

  if (!dbProduct || dbProduct.status !== "active") {
    notFound();
  }

  const defaultVariant = dbProduct.variants?.find((v: ProductVariant) => v.isDefault) || dbProduct.variants?.[0];
  const price = defaultVariant ? Number(defaultVariant.price) : 0;

  let color = "Black";
  let size = "M";

  if (defaultVariant?.attributes) {
    for (const attr of defaultVariant.attributes) {
      const val = attr.attributeValue?.value;
      if (!val) continue;
      if (["S", "M", "L", "XL", "XXL"].includes(val)) {
        size = val;
      } else {
        color = val;
      }
    }
  }

  const featuredMedia = dbProduct.media?.find((m: ProductMedia) => m.isFeatured) || dbProduct.media?.[0];
  const image = resolveImageUrl(featuredMedia?.media?.url);

  const product = {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category?.name || "Football Corner",
    team: dbProduct.brand?.name || "Juventus",
    price,
    color,
    size,
    image,
    description: dbProduct.description || "",
    variantId: defaultVariant?.id,
  };

  let relatedProducts: {
    name: string;
    category: string;
    team: string;
    price: number;
    image: string;
    slug: string;
  }[] = [];
  try {
    const res = await fetch(`${BASE_URL}/products?limit=6`, { cache: "no-store" });
    if (res.ok) {
      const result = await res.json();
      const allProducts: DBProduct[] = result.data || [];
      relatedProducts = allProducts
        .filter((p: DBProduct) => p.slug !== slug && p.status === "active")
        .slice(0, 5)
        .map((p: DBProduct) => {
          const v = p.variants?.find((vi: ProductVariant) => vi.isDefault) || p.variants?.[0];
          const pr = v ? Number(v.price) : 0;
          const fm = p.media?.find((mi: ProductMedia) => mi.isFeatured) || p.media?.[0];
          const img = resolveImageUrl(fm?.media?.url);

          return {
            name: p.name,
            category: p.category?.name || "Football Corner",
            team: p.brand?.name || "Juventus",
            price: pr,
            image: img,
            slug: p.slug,
          };
        });
    }
  } catch (err) {
    console.error("Error fetching related products:", err);
  }

  // Resolve every gallery URL through the same rewrite logic used elsewhere
  const images = dbProduct.media?.length
    ? dbProduct.media.map((m: ProductMedia) => resolveImageUrl(m.media?.url))
    : [image];

  const salePrice = product.price * 0.8;

  return (
    <main className="min-h-screen bg-white text-[#151515]">

      <section className="mx-auto py-8 mb-16 md:mb-20 lg:mb-24">
        <div className="container ">
          <div className="grid gap-8 lg:grid-cols-[560px_1fr]">
            {/* Left Column: Image Gallery */}
            <ProductImageGallery images={images} name={product.name} />

            {/* Right Column: Product Details */}
            <section className="flex flex-col">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.04em] text-neutral-400">
                <Link href="/" className="hover:text-black transition">Home</Link>
                <span>›</span>
                <Link href="/shop" className="hover:text-black transition">Shop</Link>
                <span>›</span>
                <Link href="/shop" className="hover:text-black transition">{product.category}</Link>
                <span>›</span>
                <span className="text-neutral-800">{product.name}</span>
              </div>

              {/* Product Title, Price and Navigation */}
              <div className="mt-3 flex flex-col-reverse md:flex-row items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black uppercase leading-tight tracking-tight text-neutral-900">
                    {product.name}
                  </h1>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-lg font-black text-neutral-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-2xl font-black text-neutral-900">
                      {formatPrice(salePrice)}
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

              <ProductPurchasePanel
                productName={product.name}
                productImage={product.image}
                productSlug={slug}
                variants={dbProduct.variants || []}
              />

              <div>
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
                  <WishlistButton product={product} />
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
                  <Link href={`/shop/${item.slug}`} className="block border border-neutral-100 bg-white">
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
                      <p className="mt-2 text-base font-black">{formatPrice(item.price)}</p>
                    </div>
                    <FiHeart className="mt-1 shrink-0 text-lg text-neutral-600" />
                  </div>
                </article>
              ))}
            </div>
          </section>

        </div>
      </section>
    </main>
  );
}
