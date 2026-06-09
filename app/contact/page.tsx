
import ContactForm from "@/components/contacts/ContactForm";
import Image from "next/image";

export const metadata = {
    title: 'Contact Us | Humana Vintage',
    description: 'Contact with the finest collection owners at Humana Vintage.',
};

export default function ContactPage() {
    return (
        <div className="py-12">
            {/* Banner */}
            <div className="relative w-full h-[300px] mb-12">
                <Image src="/images/contacts/banner.webp" alt="Contact Banner" fill className="object-cover" />
            </div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20 px-6">
                {/* Left Form */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">Let's talk</h1>
                    <p className="text-gray-500 mb-8">You're on the right page if you have questions, concerns, or would like to collaborate with us.</p>
                    <ContactForm />
                </div>

                {/* Right Info */}
                <div className="space-y-12">
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Humana People to People Italy</h2>
                        <div className="space-y-6 text-gray-700">
                            <div className="flex items-start gap-4">
                                <span className="text-2xl">📍</span>
                                <div>
                                    <p className="font-bold">Address</p>
                                    <p>Via Bergamo 9 B/C, 20006 Pregnana Milanese (MI)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <span className="text-2xl">📞</span>
                                <div>
                                    <p className="font-bold">Tel</p>
                                    <p>(+39) 02 93964052</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <span className="text-2xl">✉️</span>
                                <div>
                                    <p className="font-bold">Email</p>
                                    <p>vintageonline@humanaitalia.org</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}