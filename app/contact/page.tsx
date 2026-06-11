
import ContactForm from "@/components/contacts/ContactForm";
import ContactInfoCard from "@/components/contacts/ContactInfoCard";
import Image from "next/image";


export const metadata = {
    title: process.env.SHOP_NAME
        ? `Contact Us | ${process.env.SHOP_NAME}`
        : "Contact Us",
    description: process.env.SHOP_DESCRIPTION || "Discover our curated collection of unique products and treasures.",
};

export default function ContactPage() {
    return (
        <div className="py-12 bg-white">
            {/* Banner */}
            <div className="relative w-full h-[300px] mb-12">
                <Image src="/images/contacts/banner.webp" alt="Contact Banner" fill className="object-cover" />
            </div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20 px-6 ">
                {/* Left Form */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">Let's talk</h1>
                    <p className="text-gray-500 mb-8">You're on the right page if you have questions, concerns, or would like to collaborate with us.</p>
                    <ContactForm />
                </div>

                <ContactInfoCard />
            </div>
        </div>
    );
}