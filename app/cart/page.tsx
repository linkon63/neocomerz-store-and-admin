import Link from "next/link";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 text-[#151515] sm:px-8">
      <section className="mx-auto max-w-[1400px]">
        <p className="text-xs font-bold uppercase tracking-[0.14em]">Cart</p>
        <h1 className="mt-4 font-bembo text-5xl font-bold">Your shopping bag is empty</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-500">
          Add archive pieces from the shop and review them here before checkout.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex bg-black px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white"
        >
          Continue Shopping
        </Link>
      </section>
    </main>
  );
}
