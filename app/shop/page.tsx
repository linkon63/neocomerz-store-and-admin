import ShopCatalog from "./shop-catalog";

export const metadata = {
    title: 'Shop | Humana Vintage',
    description: 'Explore our curated collection of vintage treasures at Humana Vintage. Discover unique, high-quality pieces handpicked for your sustainable wardrobe.',
};


export default function ShopPage() {
  return (
    <main className="min-h-screen bg-white text-[#151515]">
      <ShopCatalog />
    </main>
  );
}
