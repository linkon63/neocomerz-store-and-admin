import FooterNewsletter from "./ui/footer-newsletter";
import FooterPayment from "./ui/footer-payment";
import FooterLinks from "./ui/footer-links";
import Link from "next/dist/client/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";

export default function Bottomfooter() {

  return (
    <section className="relative w-full h-full min-h-107.5 overflow-hidden flex items-end">
      {/* YouTube Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <iframe
          src="https://www.youtube.com/embed/CFfP9DFeOog?autoplay=1&mute=1&loop=1&playlist=CFfP9DFeOog&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
          allow="autoplay; encrypted-media"
          className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            minWidth: '100vw',
            minHeight: '100vh',
          }}
        />
        <div className="absolute inset-0 bg-black/50 z-1"></div>
      </div>

      <div className="bottom-footer-wrapper relative z-10 w-full py-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-8">
            
            <FooterPayment />

            <div className="text-center space-y-6">
              {/* Social Icons */}
              <div className="flex items-center justify-center gap-2">
                <p className="text-white text-sm font-['Gotham']">Follow Us on</p>
                <div className="flex items-center justify-center gap-4">
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
              </div>

              <FooterNewsletter />
            </div>
            <div className="text-center md:text-right">
              <p className="text-white text-sm font-['Gotham'] mb-1">Customer Service</p>
              <p className="text-white text-lg font-['Gotham'] font-medium">Hours: M-F 9AM-5PM</p>
            </div>

          </div>

          <FooterLinks />

        </div>
      </div>
    </section>
  );
}
