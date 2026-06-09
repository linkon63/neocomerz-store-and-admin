import Link from "next/link";

export default function TheBrand() {
  return (
    <section className="Thebrand-wrapper bg-[#ffd3f3] px-4 py-14 text-center sm:px-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em]">The brand</p>
      <h2 className="mt-4 font-bembo text-3xl font-bold sm:text-4xl">
        Experience our quality firsthand
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-6">
        Every piece is selected for character, condition, and the story it carries.
        Discover expressive vintage staples made for everyday wear.
      </p>
      <Link
        href="/shop"
        className="mt-7 inline-flex bg-black px-6 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
      >
        See the story
      </Link>
    </section>
  );
}
