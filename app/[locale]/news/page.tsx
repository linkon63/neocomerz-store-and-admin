import NewsList from "./news-list";

export const metadata = {
  title: process.env.SHOP_NAME ? `News & Blog | ${process.env.SHOP_NAME}` : "News & Blog",
  description:
    process.env.SHOP_DESCRIPTION ||
    "The latest news, stories, and updates from Humana Vintage.",
};

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-white text-[#151515]">
      <NewsList />
    </main>
  );
}
