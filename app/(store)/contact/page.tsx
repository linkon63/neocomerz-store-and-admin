'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FiPhone, FiMail, FiMapPin, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    countryCode: '+880',
    phoneNumber: '',
    message: '',
  });

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact Form Submitted:', formData);
    alert('Thank you for contacting us! We will get back to you shortly.');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'WHERE DO YOUR TEAS COME FROM?',
      answer: 'London Tea Exchange sources premium teas directly from tea estates across more than 20 countries. The collection includes over 300 varieties of luxury and rare teas, many of which are exclusive to London Tea Exchange.',
    },
    {
      question: 'DO YOU OFFER INTERNATIONAL SHIPPING?',
      answer: 'Yes, we ship our premium collections globally. Delivery times and shipping rates vary depending on the destination country. Custom duties and taxes may apply upon arrival.',
    },
    {
      question: 'HOW LONG DOES DELIVERY TAKE?',
      answer: 'Standard domestic deliveries within the country typically take 2-4 business days. International deliveries may take 7-14 business days depending on customs processing and shipping methods.',
    },
    {
      question: 'ARE YOUR TEAS ETHICALLY SOURCED?',
      answer: 'Absolutely. Ethical sourcing is at the core of our brand values. We work directly with estates that prioritize fair wages, safe working conditions, and sustainable farming methods to preserve local ecosystems.',
    },
  ];

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

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* COMBINED CONTAINER: Contact Form, Info & Map */}
        <div className="bg-white rounded-xl shadow-2xl border border-white/50 overflow-hidden">
          {/* CONTAINER 1: Contact Form & Info */}
          <div className="p-8 sm:p-12 md:p-16">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="font-['Bembo_Std'] text-4xl sm:text-5xl text-[#C6B485] font-normal tracking-wide">
                Contact <span className="font-['Snell_Roundhand_LT_Std'] italic text-stone-850 lowercase text-5xl sm:text-6xl -ml-1">us</span>
              </h1>
              <p className="font-['Bembo_Std'] text-stone-400 text-xs sm:text-sm tracking-wide mt-4 font-light max-w-xl mx-auto">
                Where our dedication to tea is matched by a distinguished history of excellence.
              </p>
            </div>

            {/* Form and Details Grid */}
            <div className="self-stretch p-4 sm:p-12 flex flex-col lg:flex-row justify-start items-start gap-12">
              
              {/* Left Column (Contact Form) */}
              <div className="flex-1 w-full inline-flex flex-col justify-center items-start gap-12">
                <div className="self-stretch flex flex-col justify-start items-start gap-6">
                  <div className="justify-start text-neutral-800 text-4xl font-normal font-['Bembo_Std'] leading-10">Your Inquiries Matter</div>
                  <div className="self-stretch justify-start text-zinc-600 text-lg font-normal font-['Bembo_Std'] leading-6">
                    We understand that our clients take comfort in knowing that quality is at the heart of everything we do.
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="self-stretch flex flex-col justify-start items-start gap-3 w-full">
                  {/* Name fields */}
                  <div className="self-stretch inline-flex flex-col sm:flex-row justify-start items-start gap-3 w-full">
                    <div className="flex-1 w-full inline-flex flex-col justify-start items-start overflow-hidden">
                      <div className="justify-start text-neutral-800 text-lg font-normal font-['Bembo_Std'] leading-6 mb-1.5">First Name</div>
                      <div className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-start items-center gap-0.5 bg-white focus-within:outline-[#C5B382]">
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Enter first name"
                          className="w-full bg-transparent border-0 p-0 text-neutral-800 text-xs font-medium font-['Gotham'] leading-4 placeholder-zinc-300 focus:outline-none focus:ring-0"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full inline-flex flex-col justify-start items-start overflow-hidden">
                      <div className="justify-start text-neutral-800 text-lg font-normal font-['Bembo_Std'] leading-6 mb-1.5">Last Name</div>
                      <div className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-start items-center gap-0.5 bg-white focus-within:outline-[#C5B382]">
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Enter last name"
                          className="w-full bg-transparent border-0 p-0 text-neutral-800 text-xs font-medium font-['Gotham'] leading-4 placeholder-zinc-300 focus:outline-none focus:ring-0"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone field */}
                  <div className="self-stretch flex flex-col justify-start items-start overflow-hidden w-full">
                    <div className="justify-start text-neutral-800 text-lg font-normal font-['Bembo_Std'] leading-6 mb-1.5">Phone Number</div>
                    <div className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-start items-center gap-3 bg-white focus-within:outline-[#C5B382]">
                      <div className="flex justify-start items-center gap-1">
                        <select
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleInputChange}
                          className="bg-transparent text-neutral-800 text-xs font-medium font-['Gotham'] leading-4 focus:outline-none cursor-pointer appearance-none pr-1"
                        >
                          <option value="+880">+880</option>
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                          <option value="+91">+91</option>
                        </select>
                        <div className="w-2.5 h-1.5 relative overflow-hidden pointer-events-none -ml-1 flex items-center justify-center">
                          <svg className="w-2.5 h-1.5 text-neutral-800" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.2">
                            <path d="M1 1L5 5L9 1" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                      <div className="w-px h-4 bg-neutral-850 self-stretch"></div>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Phone Number"
                        className="w-full bg-transparent border-0 p-0 text-neutral-800 text-xs font-medium font-['Gotham'] leading-4 placeholder-zinc-300 focus:outline-none focus:ring-0"
                        required
                      />
                    </div>
                  </div>

                  {/* Message field */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                    <div className="justify-start text-neutral-800 text-lg font-normal font-['Bembo_Std'] leading-6">Your Message</div>
                    <div className="self-stretch px-3 pt-3 pb-12 outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex justify-start items-start bg-white rounded-lg focus-within:outline-[#C5B382]">
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Write here ..."
                        rows={4}
                        className="w-full bg-transparent border-0 p-0 text-neutral-800 text-xs font-medium font-['Gotham'] leading-4 placeholder-zinc-300 focus:outline-none focus:ring-0 resize-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-[#D2C498] to-[#B9975B] hover:opacity-95 rounded-[100px] flex flex-col justify-start items-start gap-2 cursor-pointer transition-opacity duration-300 mt-2 border-0"
                  >
                    <div className="justify-start text-white text-base font-medium font-['Gotham'] uppercase leading-5 tracking-widest">Submit</div>
                  </button>
                </form>
              </div>

              {/* Vertical Crest Divider */}
              <div className="hidden lg:flex flex-col items-center justify-between py-6 self-stretch">
                {[...Array(12)].map((_, i) => (
                  <img 
                    key={i} 
                    src="/images/icons/icon-3.svg" 
                    alt="Crest Icon" 
                    className="w-7 h-8 my-1 hover:scale-110 transition-transform duration-300 opacity-60"
                  />
                ))}
              </div>

              {/* Right Column (Contact & Address) */}
              <div className="flex-1 w-full inline-flex flex-col justify-start items-start gap-12 lg:pl-12">
                <div className="self-stretch flex flex-col justify-start items-start gap-6">
                  <div className="justify-start text-neutral-800 text-4xl font-normal font-['Bembo_Std'] leading-10">Contact</div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="p-1 inline-flex justify-start items-center gap-3">
                      <div className="w-4 h-4 relative overflow-hidden flex items-center justify-center text-[#A38148]">
                        <FiPhone className="w-4 h-4" />
                      </div>
                      <div className="justify-start text-neutral-800 text-lg font-normal font-['Bembo_Std'] leading-6">+8801339-879494</div>
                    </div>
                    <div className="p-1 inline-flex justify-start items-center gap-3">
                      <div className="w-4 h-4 relative overflow-hidden flex items-center justify-center text-[#A38148]">
                        <FiMail className="w-4 h-4" />
                      </div>
                      <a href="mailto:store@londonteaexchangebd.com" className="justify-start text-neutral-800 text-lg font-normal font-['Bembo_Std'] leading-6 hover:text-[#A38148] transition-colors">
                        store@londonteaexchangebd.com
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="self-stretch flex flex-col justify-start items-start gap-6">
                  <div className="justify-start text-neutral-800 text-4xl font-normal font-['Bembo_Std'] leading-10">Visit Us</div>
                  <div className="self-stretch p-1 inline-flex justify-start items-start gap-3">
                    <div className="w-4 h-4 relative overflow-hidden flex items-center justify-center text-[#A38148] mt-1">
                      <FiMapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 justify-start text-neutral-800 text-lg font-normal font-['Bembo_Std'] leading-6">
                      Pan Pacific Sonargaon, Dhaka. 107 Kazi Nazrul Islam Ave, Dhaka 1215, Bangladesh
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* INTERMEDIATE SECTION: Embedded Google Map (Flush inside parent) */}
          <div className="w-full overflow-hidden border-t border-stone-100 mt-0">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.206636737526!2d90.39276537604313!3d23.73998158918908!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8967b670391%3A0x6b40280f93019803!2sPan%20Pacific%20Sonargaon%20Dhaka!5e0!3m2!1sen!2sbd!4v1710000000000!5m2!1sen!2sbd"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Pan Pacific Sonargaon Dhaka Map"
            ></iframe>
          </div>
        </div>

        {/* CONTAINER 2: FAQ & Featured Products */}
        <div className="self-stretch p-6 sm:p-12 bg-neutral-100 rounded-xl flex flex-col lg:flex-row justify-start items-start gap-12 lg:gap-24 mt-10 shadow-2xl border border-white/50">
          <div className="flex-1 w-full self-stretch inline-flex flex-col justify-between items-start gap-8 lg:gap-0">
            <div className="self-stretch flex flex-col justify-start items-start gap-6">
              <div className="self-stretch justify-start text-neutral-800 text-4xl font-normal font-['Bembo_Std'] leading-10">Frequently Asked Questions</div>
              <div className="self-stretch justify-start text-zinc-600 text-lg font-normal font-['Bembo_Std'] leading-6">Answers to Your Most Common Questions – Quick and Clear!</div>
            </div>
            
            <div className="self-stretch flex flex-col justify-start items-start gap-3">
              <div className="justify-start text-zinc-600 text-xs font-medium font-['Gotham'] leading-4">You may also like</div>
              <div className="self-stretch inline-flex justify-start items-center gap-6">
                
                {/* Best Sellers */}
                <div className="inline-flex flex-col justify-center items-start gap-3 group cursor-pointer">
                  <div className="relative w-36 h-36 bg-stone-200 overflow-hidden rounded-md">
                    <Image
                      src="/images/products/product-1.webp"
                      alt="Best Sellers"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="justify-start text-zinc-600 text-xl font-normal font-['Gotham'] leading-6">Best Sellers</div>
                </div>

                {/* New Arrivals */}
                <div className="inline-flex flex-col justify-center items-start gap-3 group cursor-pointer">
                  <div className="relative w-36 h-36 bg-stone-200 overflow-hidden rounded-md">
                    <Image
                      src="/images/products/product-2.webp"
                      alt="New Arrivals"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="justify-start text-zinc-600 text-xl font-normal font-['Gotham'] leading-6">New Arrivals</div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column (Accordions) */}
          <div className="w-full lg:w-[474px] inline-flex flex-col justify-start items-start">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className={`self-stretch py-6 border-b border-zinc-300 flex flex-col justify-start items-start gap-3 transition-all duration-300 ${
                    index === 0 ? 'border-t' : ''
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between text-left font-['Bembo_Std'] text-neutral-800 text-lg font-normal uppercase leading-6 select-none focus:outline-none hover:text-[#C6B485] transition-colors duration-200"
                  >
                    <span>{faq.question}</span>
                    <div className={`w-9 h-9 rounded-[100px] flex justify-center items-center shrink-0 ml-3 transition-colors duration-300 ${
                      isOpen ? 'bg-neutral-600 text-white' : 'bg-white text-neutral-600'
                    }`}>
                      <div className="w-5 h-5 relative overflow-hidden flex items-center justify-center">
                        <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M1 1L5 5L9 1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </button>
                  
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="justify-start text-zinc-600 text-lg font-normal font-['Bembo_Std'] leading-6 pt-2 pr-6">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </main>
  );
}
