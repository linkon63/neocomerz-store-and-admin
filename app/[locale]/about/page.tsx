import AboutBottomSlide from "@/components/about/AboutBottomSlide";
import Image from "next/image";
import { getTranslator } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/config";

export const metadata = {
    title: process.env.SHOP_NAME
        ? `About Us | ${process.env.SHOP_NAME}`
        : "About Us",
    description: process.env.SHOP_DESCRIPTION || "Discover our curated collection of unique products and treasures.",
};

export default async function AboutPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslator(locale as Locale);

    const sectionsData = [
        {
            id: 1,
            title: t("about.section1Title"),
            description: t("about.section1Description"),
            image: "/images/about/img4.webp"
        },
        {
            id: 2,
            title: t("about.section2Title"),
            description: t("about.section2Description"),
            image: "/images/about/img5.webp"
        },
        {
            id: 3,
            title: t("about.section3Title"),
            description: t("about.section3Description"),
            image: "/images/about/img6.webp"
        }
    ];

    const statsData = [
        { count: "29", label: t("about.statOrganizations") },
        { count: "535", label: t("about.statStores") },
        { count: "1238", label: t("about.statProjects") },
        { count: "9.6 million", label: t("about.statBeneficiaries") },
    ];

    return (
        <div className="space-y-20 md:space-y-32 pb-20 bg-white">

            {/* Hero Section */}
            <section className="bg-[#FFD7FC] px-6 py-20 md:py-32 flex flex-col items-center text-center">
                <h3 className="text-xs md:text-sm font-bold tracking-[0.2em] text-gray-800 uppercase mb-6">
                    {t("about.heroEyebrow")}
                </h3>
                <h1 className="text-3xl md:text-5xl font-serif text-gray-900 mb-8 max-w-3xl leading-tight">
                    {t("about.heroTitle")}
                </h1>
                <p className="text-base md:text-lg text-gray-700 max-w-3xl leading-relaxed">
                    {t("about.heroSubtitle")}
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
                    {t("about.federationEyebrow")}
                </h4>
                <h2 className="text-3xl md:text-5xl font-serif text-gray-900 mb-16">
                    {t("about.federationTitle")}
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
