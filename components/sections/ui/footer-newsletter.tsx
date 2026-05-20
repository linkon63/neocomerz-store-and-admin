import Link from "next/link";
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaWhatsapp } from "react-icons/fa";

export default function FooterNewsletter() {
  return (
    <div className="bg-brand-5 py-8 border-b border-brand-4">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <Link href="https://facebook.com" target="_blank" className="text-white hover:text-brand-3 transition-colors">
              <FaFacebookF className="w-5 h-5" />
            </Link>
            <Link href="https://linkedin.com" target="_blank" className="text-white hover:text-brand-3 transition-colors">
              <FaLinkedinIn className="w-5 h-5" />
            </Link>
            <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-3 transition-colors">
              <FaInstagram className="w-5 h-5" />
            </Link>
            <Link href="https://wa.me/+8801711992256" target="_blank" className="text-white hover:text-brand-3 transition-colors">
              <FaWhatsapp className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex items-center w-full max-w-2xl bg-white border border-gray-300 p-0  sm:p-3">
            <input
              type="email"
              placeholder="Join Our Newsletter Now"
              className="flex-1 bg-white px-2 sm:px-6 py-3 font-gotham text-sm text-gray-800 placeholder:text-gray-500 outline-none"
            />
            <button className="bg-white text-gray-800 px-2 sm:px-8 py-3 font-gotham text-sm font-medium uppercase hover:bg-brand-3 hover:text-white transition-colors border-l border-gray-300 cursor-pointer">
              SUBSCRIBE
            </button>
          </div>
          <div className="text-start">
            <p className="font-gotham text-white text-sm">Customer Service</p>
            <p className="font-gotham text-white text-sm font-medium">Hours: M-F 9AM-5PM CST</p>
          </div>
        </div>
      </div>
    </div>
  );
}
