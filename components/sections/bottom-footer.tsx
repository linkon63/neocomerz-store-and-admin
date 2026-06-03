import { GiTeapotLeaves } from "react-icons/gi";
import FooterNewsletter from "./ui/footer-newsletter";
import FooterPayment from "./ui/footer-payment";
import FooterLinks from "./ui/footer-links";

export default function Bottomfooter() {
  const features = [
    {
      icon: <GiTeapotLeaves />,
      title: "Sovereign Seal",
    },
    {
      icon: <GiTeapotLeaves />,
      title: "Grand Passage",
    },
    {
      icon: <GiTeapotLeaves />,
      title: "Noble Balance",
    },
    {
      icon: <GiTeapotLeaves />,
      title: "World Assembly",
    },
  ];

  return (
    <section className="w-full">
      <div className="bottom-footer-wrapper">
        {/* Top Section with Background Image */}
        <div
          className="relative w-full h-120 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/footer/footerbanner.png')" }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Content - Positioned at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 pb-8">
            <div className="container mx-auto px-4 sm:px-6">
              {/* Features */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex flex-row items-center text-center gap-1"
                  >
                    <div className="text-3xl mb-2 text-white">
                      {feature.icon}
                    </div>
                    <h3 className="font-bembo text-white text-xl uppercase">
                      {feature.title}
                    </h3>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="max-w-6xl mx-auto text-center">
                <p className="font-gotham text-white text-sm leading-relaxed">
                  Rooted in the fertile landscapes of Sylhet, our teas stand beyond origin—carrying with them the character of place, time, and craft. Inspired by the ways of artisan farmers who prioritize every selection not as a commodity, but as a refined expression of nature and intention.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Newsletter */}
        <FooterNewsletter />

        {/* Payment Methods Section */}
        <FooterPayment />

        {/* Bottom Links Section */}
        <FooterLinks />
      </div>
    </section>
  );
}
