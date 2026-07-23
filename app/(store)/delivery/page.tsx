'use client';

import React from 'react';
import { FiTruck, FiMapPin, FiInfo, FiClock, FiPhone } from 'react-icons/fi';
import ScrollAnimate from '@/components/ui/scroll-animate';

export default function DeliveryPage() {
  return (
    <main className="relative w-full bg-[#4A4C48] py-16 px-4 sm:px-6 md:px-8 lg:py-24 overflow-hidden">
      {/* Repeating Luxury Pattern Image */}
      <div 
        className="absolute inset-0 z-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: "url('/images/pattern/pattern.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "150px 150px",
        }}
      ></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <ScrollAnimate variant="fade-in-up">
          <div className="bg-white rounded-xl shadow-2xl border border-white/50 overflow-hidden p-8 sm:p-12 md:p-16">
            
            {/* Header */}
            <div className="text-center mb-12 sm:mb-16">
              <h1 className="font-['Bembo_Std'] text-4xl sm:text-5xl text-[#C6B485] font-normal tracking-wide">
                Delivery <span className="font-['Snell_Roundhand_LT_Std'] italic text-stone-850 lowercase text-5xl sm:text-6xl -ml-1">Information</span>
              </h1>
              <p className="font-['Bembo_Std'] text-stone-400 text-xs sm:text-sm tracking-wide mt-4 font-light max-w-xl mx-auto">
                Prompt, secure, and nationwide delivery for our premium collections.
              </p>
            </div>

            {/* Introduction */}
            <div className="text-center mb-12">
              <p className="font-['Bembo_Std'] text-stone-700 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
                We are pleased to offer nationwide delivery across Bangladesh, ensuring that the finest teas reach you in perfect condition.
              </p>
            </div>

            {/* Estimates Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              
              {/* Inside Dhaka */}
              <div className="border border-stone-200 hover:border-[#C6B485] transition-all duration-300 rounded-lg p-8 flex flex-col items-center text-center bg-stone-50 group">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-[#A38148] mb-6 group-hover:bg-[#A38148] group-hover:text-white transition-all duration-300">
                  <FiMapPin className="w-8 h-8" />
                </div>
                <h3 className="font-['Bembo_Std'] text-2xl text-neutral-800 font-medium mb-3">Within Dhaka</h3>
                <p className="font-['Gotham'] text-[#C6B485] text-lg font-semibold mb-4">2 – 4 Business Days</p>
                <p className="font-['Bembo_Std'] text-stone-500 text-base leading-relaxed">
                  Fast shipping directly to your doorstep in the capital city.
                </p>
              </div>

              {/* Outside Dhaka */}
              <div className="border border-stone-200 hover:border-[#C6B485] transition-all duration-300 rounded-lg p-8 flex flex-col items-center text-center bg-stone-50 group">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-[#A38148] mb-6 group-hover:bg-[#A38148] group-hover:text-white transition-all duration-300">
                  <FiTruck className="w-8 h-8" />
                </div>
                <h3 className="font-['Bembo_Std'] text-2xl text-neutral-800 font-medium mb-3">Outside Dhaka</h3>
                <p className="font-['Gotham'] text-[#C6B485] text-lg font-semibold mb-4">3 – 7 Business Days</p>
                <p className="font-['Bembo_Std'] text-stone-500 text-base leading-relaxed">
                  Reliable shipping options reaching all other districts across Bangladesh.
                </p>
              </div>

            </div>

            {/* Note on variation */}
            <div className="flex items-start gap-4 bg-[#F9F6EE] border-l-4 border-[#C6B485] p-5 rounded-r-lg mb-12">
              <FiInfo className="w-6 h-6 text-[#A38148] shrink-0 mt-0.5" />
              <div className="font-['Bembo_Std'] text-stone-700 text-base leading-relaxed">
                <strong>Delivery Notice:</strong> Delivery times may vary depending on the destination, courier operations, and public holidays.
              </div>
            </div>

            {/* Call to action */}
            <div className="text-center pt-8 border-t border-stone-150">
              <h4 className="font-['Bembo_Std'] text-xl text-neutral-800 font-medium mb-3">Order Status & Inquiries</h4>
              <p className="font-['Bembo_Std'] text-stone-500 text-sm mb-6">
                Need help with your order or shipment? Contact us via bKash or WhatsApp:
              </p>
              <a 
                href="https://wa.me/8801339879494" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#D2C498] to-[#B9975B] hover:opacity-95 text-white text-base font-medium font-['Gotham'] uppercase tracking-widest rounded-full transition-opacity duration-300"
              >
                <FiPhone className="w-5 h-5" />
                +880 13 3987 9494
              </a>
            </div>

          </div>
        </ScrollAnimate>
      </div>
    </main>
  );
}
