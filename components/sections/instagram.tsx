import Image from "next/image";
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaWhatsapp } from "react-icons/fa";

const instagramImages = [
  "/images/footer/instagram/instagram-1.png",
  "/images/footer/instagram/instagram-2.png",
  "/images/footer/instagram/instagram-3.png",
  "/images/footer/instagram/instagram-4.png",
  "/images/footer/instagram/instagram.png",
];

export default function Instagram() {
  return (
    <section className="relative w-full bg-[#D9D9D6] pt-16 md:pt-36 pb-5">
      <div className="mx-auto">
        <div className="mb-8 text-center">
          <h2 className="font-['Snell_Roundhand_LT_Std'] text-5xl text-black">
            Follow<span className="italic">us on</span>
          </h2>
          
          {/* Social Icons */}
          <div className="mt-6 flex items-center justify-center gap-6">
            <a href="#" className="text-black hover:text-neutral-600 transition">
              <FaFacebookF className="text-xl" />
            </a>
            <a href="#" className="text-black hover:text-neutral-600 transition">
              <FaLinkedinIn className="text-xl" />
            </a>
            <a href="#" className="text-black hover:text-neutral-600 transition">
              <FaInstagram className="text-xl" />
            </a>
            <a href="#" className="text-black hover:text-neutral-600 transition">
              <FaWhatsapp className="text-xl" />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {instagramImages.map((image, index) => (
            <div key={index} className="relative aspect-square overflow-hidden">
              <Image
                src={image}
                alt={`Instagram post ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
