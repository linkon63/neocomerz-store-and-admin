import ShopCatalog from "./shop-catalog";

export const metadata = {
  title: process.env.SHOP_NAME
    ? `Shop | ${process.env.SHOP_NAME}`
    : "Shop",
  description: process.env.SHOP_DESCRIPTION || "Discover our curated collection of unique products and treasures.",
};


export default function ShopPage() {
  return (
    <main className="min-h-screen bg-white text-[#151515]">
      <ShopCatalog />
    </main>
  );
}
