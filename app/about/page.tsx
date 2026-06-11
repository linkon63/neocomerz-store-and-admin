import AboutBottomSlide from "@/components/about/AboutBottomSlide";
import Image from "next/image";

export const metadata = {
    title: `About Us | ${process.env.SHOP_NAME}`,
    description: process.env.SHOP_DESCRIPTION,
};

const sectionsData = [
    {
        id: 1,
        title: "Who We Are",
        description: "We are an international non-profit dedicated to driving sustainable growth within the global textile industry. For over two decades, our mission has been to turn pre-loved clothing into powerful tools for change. By collecting and responsibly managing garments, we fund vital social initiatives—from local community support in Italy to large-scale humanitarian programs across education and agriculture in 45 countries. We bridge the gap between ethical fashion and global impact.",
        image: "/images/about/img4.webp"
    },
    {
        id: 2,
        title: "Our Core Vision",
        description: "We believe that progress isn't built on big promises, but on consistent, small actions. Our approach is purely practical: we empower individuals to take control of their future through community-driven support. We don't focus on abstract theories; instead, we focus on the tangible difference each person can make. When we join forces, those small individual steps combine to create a lasting, positive shift for our planet and its people.",
        image: "/images/about/img5.webp"
    },
    {
        id: 3,
        title: "Where Style Meets Values",
        description: "Our vintage boutiques are designed to honor the history of every garment we rescue. We hand-pick authentic pieces from the 60s through the 90s, giving them a new chapter in their life story. We hold the firm belief that ethical choices should be beautiful and affordable. By launching this online platform, we are making sustainable fashion reachable to everyone, everywhere. Since every item in our collection is one-of-a-kind, our online finds are distinct from what you'll see in our physical shops.",
        image: "/images/about/img6.webp"
    }
];

const statsData = [
    { count: "29", label: "Organizations" },
    { count: "535", label: "Stores in Europe" },
    { count: "1238", label: "Social projects" },
    { count: "9.6 million", label: "Beneficiaries" },
];

export default function AboutPage() {
    return (
        <div className="space-y-20 md:space-y-32 pb-20 bg-white">

            {/* Hero Section */}
            <section className="bg-[#FFD7FC] px-6 py-20 md:py-32 flex flex-col items-center text-center">
                <h3 className="text-xs md:text-sm font-bold tracking-[0.2em] text-gray-800 uppercase mb-6">
                    Our Mission
                </h3>
                <h1 className="text-3xl md:text-5xl font-serif text-gray-900 mb-8 max-w-3xl leading-tight">
                    A single thread connecting the world
                </h1>
                <p className="text-base md:text-lg text-gray-700 max-w-3xl leading-relaxed">
                    Our reach extends across continents, driven by a shared vision to reshape the fabric of our communities. We believe in the power of transparency and the strength of genuine connections.
                </p>
            </section>

            {/* Content Sections */}
            <section className="px-6 max-w-7xl mx-auto space-y-20 md:space-y-32">
                {sectionsData.map((item, index) => (
                    <div
                        key={item.id}
                        className={`flex flex-col md:flex-row items-center gap-10 md:gap-20 ${index % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
                    >
                        {/* Image Part */}
                        <div className="w-full md:w-1/2 relative h-[350px] md:h-[450px] overflow-hidden rounded-xl">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>

                        {/* Text Part */}
                        <div className="w-full md:w-1/2">
                            <h2 className="text-2xl md:text-4xl font-serif text-gray-900 mb-6">
                                {item.title}
                            </h2>
                            <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </section>

            <AboutBottomSlide />

            {/* Bottom Stat */}
            <section className="px-6 py-20 bg-[#F4F4F2] text-center">
                <h4 className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-gray-800 mb-4">
                    The Federation
                </h4>
                <h2 className="text-3xl md:text-5xl font-serif text-gray-900 mb-16">
                    An International Network
                </h2>

                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {statsData.map((item, index) => (
                        <div key={index} className="flex flex-col">
                            <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
                                {item.count}
                            </h3>
                            <p className="text-sm md:text-base text-gray-600 font-medium uppercase tracking-wide">
                                {item.label}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}