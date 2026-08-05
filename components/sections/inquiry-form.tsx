'use client';
 
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useAuth } from '@/app/_providers/auth-provider';
import { submitWholesaleRequest } from '@/lib/storefront-api';
import { fetchShopProducts } from '@/lib/shop-api';
import { corporateInquiryValidation, type CorporateInquiryErrors } from '@/utils/validation';
 
export default function InquiryForm() {
  const { isAuthenticated, setShowAuthModal } = useAuth();
  const [defaultProduct, setDefaultProduct] = useState<{ id: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<CorporateInquiryErrors>({});
 
  const [formData, setFormData] = useState({
    fullName: '',
    organisation: '',
    email: '',
    countryCode: '+880',
    phoneNumber: '',
    purpose: '',
    preferredCollection: '',
    deliveryDate: '',
    quantity: '',
    requirements: '',
  });
 
  useEffect(() => {
    fetchShopProducts({ page: 1, limit: 1 })
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setDefaultProduct({ id: res.data[0].id });
        }
      })
      .catch((err) => console.error('Failed to fetch default product for inquiry:', err));
  }, []);
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = corporateInquiryValidation(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please fill the highlighted fields');
      return;
    }
    setErrors({});

    if (!isAuthenticated) {
      toast.error('Please login to submit your corporate inquiry.');
      setShowAuthModal(true);
      return;
    }

    if (!defaultProduct) {
      toast.error('Retrieving shop catalog, please try again in a moment.');
      return;
    }

    setSubmitting(true);
    try {
      const quantityNum = parseInt(formData.quantity) || 100;
      const customerNoteText = `
Corporate Gifting / Event Inquiry Details:
- Full Name: ${formData.fullName}
- Company/Organisation: ${formData.organisation}
- Contact Email: ${formData.email}
- Purpose of Inquiry: ${formData.purpose || 'N/A'}
- Preferred Collection: ${formData.preferredCollection || 'N/A'}
- Required Delivery Date: ${formData.deliveryDate || 'N/A'}
- Estimated Quantity: ${formData.quantity || 'N/A'}
- Additional Requirements: ${formData.requirements || 'N/A'}
      `.trim();

      await submitWholesaleRequest({
        contactPhone: `${formData.countryCode}${formData.phoneNumber}`,
        customerNote: customerNoteText,
        items: [
          {
            productId: defaultProduct.id,
            requestedQuantity: quantityNum,
            note: `Estimated Quantity: ${formData.quantity || '100'}`,
          },
        ],
      });

      try {
        await fetch('/api/resend/corporate-inquiry', {
          method: 'POST',
          body: JSON.stringify(formData),
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (notifyErr) {
        console.error('Resend corporate inquiry notification failed:', notifyErr);
      }

      toast.success('Thank you! Your corporate inquiry has been submitted successfully.');
      setErrors({});
      setFormData({
        fullName: '',
        organisation: '',
        email: '',
        countryCode: '+880',
        phoneNumber: '',
        purpose: '',
        preferredCollection: '',
        deliveryDate: '',
        quantity: '',
        requirements: '',
      });
    } catch (err: any) {
      console.error('Submit inquiry failed:', err);
      toast.error(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };
 
  return (
    <section id="inquiry-form" className="w-full bg-[#F9F9FB] py-16 sm:py-24 px-6 md:px-12">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column (Content) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="space-y-4">
              <h2 className="font-['Bembo_Std'] text-3xl sm:text-4xl text-[#1C1C1C] font-normal leading-tight">
                Let&apos;s Curate Something Worth Remembering
              </h2>
              <p className="font-gotham text-stone-500 text-xs sm:text-sm leading-relaxed">
                Whether you&apos;re planning executive gifts, elevating your hospitality experience, or
                creating a bespoke collection for a special occasion, we&apos;d be delighted to curate a
                solution tailored to your vision.
              </p>
            </div>
 
            {/* "You may also like" products */}
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <h3 className="font-gotham text-xs font-semibold uppercase tracking-wider text-stone-400">
                You may also like
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Best Sellers */}
                <div className="group cursor-pointer">
                  <div className="relative aspect-square w-full bg-stone-100 overflow-hidden mb-2">
                    <Image
                      src="/images/products/product-1.webp"
                      alt="Best Sellers"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h4 className="font-['Bembo_Std'] text-sm text-[#1C1C1C] font-medium tracking-wide">
                    Best Sellers
                  </h4>
                </div>
 
                {/* New Arrivals */}
                <div className="group cursor-pointer">
                  <div className="relative aspect-square w-full bg-stone-100 overflow-hidden mb-2">
                    <Image
                      src="/images/products/product-2.webp"
                      alt="New Arrivals"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h4 className="font-['Bembo_Std'] text-sm text-[#1C1C1C] font-medium tracking-wide">
                    New Arrivals
                  </h4>
                </div>
              </div>
            </div>
          </div>
 
          {/* Right Column (Form Card) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-lg border border-stone-100">
              <div className="mb-8">
                <h3 className="font-['Bembo_Std'] text-2xl sm:text-3xl text-[#1C1C1C] font-normal mb-2">
                  Tell Us About Your Requirement
                </h3>
                <p className="font-gotham text-xs text-stone-500 leading-relaxed">
                  Our specialists will prepare a personalised recommendation and quotation based on your needs.
                </p>
              </div>
 
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Contact Information Divider */}
                <div className="space-y-4">
                  <h4 className="font-gotham text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Contact Information
                  </h4>
                  
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-['Bembo_Std'] text-xs uppercase tracking-wide text-stone-700">Full Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter full name"
                        className="w-full px-4 py-3 border border-stone-200 rounded-md text-xs font-gotham text-stone-850 placeholder-stone-300 focus:outline-none focus:border-stone-400"
                      />
                      {errors.fullName && (
                        <p className="text-xs text-red-500 font-gotham">{errors.fullName}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-['Bembo_Std'] text-xs uppercase tracking-wide text-stone-700">Organisation/Company</label>
                      <input
                        type="text"
                        name="organisation"
                        value={formData.organisation}
                        onChange={handleInputChange}
                        placeholder="Enter organization/company name"
                        className="w-full px-4 py-3 border border-stone-200 rounded-md text-xs font-gotham text-stone-850 placeholder-stone-300 focus:outline-none focus:border-stone-400"
                      />
                      {errors.organisation && (
                        <p className="text-xs text-red-500 font-gotham">{errors.organisation}</p>
                      )}
                    </div>
                  </div>
 
                  {/* Row 2 */}
                  <div className="space-y-1.5">
                    <label className="font-['Bembo_Std'] text-xs uppercase tracking-wide text-stone-700">Email Address <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      className="w-full px-4 py-3 border border-stone-200 rounded-md text-xs font-gotham text-stone-850 placeholder-stone-300 focus:outline-none focus:border-stone-400"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 font-gotham">{errors.email}</p>
                    )}
                  </div>
 
                  {/* Row 3 */}
                  <div className="space-y-1.5">
                    <label className="font-['Bembo_Std'] text-xs uppercase tracking-wide text-stone-700">Phone Number <span className="text-red-500">*</span></label>
                    <div className="flex border border-stone-200 rounded-md overflow-hidden">
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleInputChange}
                        className="px-3 py-3 bg-stone-50 border-r border-stone-200 text-xs font-gotham text-stone-700 focus:outline-none cursor-pointer"
                      >
                        <option value="+880">+880 (BD)</option>
                        <option value="+1">+1 (US)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+91">+91 (IN)</option>
                      </select>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Phone Number"
                        className="w-full px-4 py-3 text-xs font-gotham text-stone-850 placeholder-stone-300 focus:outline-none"
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-xs text-red-500 font-gotham">{errors.phoneNumber}</p>
                    )}
                  </div>
                </div>
 
                {/* Inquiry Details Divider */}
                <div className="space-y-4 pt-2 border-t border-stone-100">
                  <h4 className="font-gotham text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Inquiry Details
                  </h4>
 
                  {/* Row 4 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-['Bembo_Std'] text-xs uppercase tracking-wide text-stone-700">Purpose of Inquiry <span className="text-red-500">*</span></label>
                      <select
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-stone-200 rounded-md text-xs font-gotham text-stone-850 focus:outline-none focus:border-stone-400 cursor-pointer"
                      >
                        <option value="">Select</option>
                        <option value="corporate">Corporate Gifting</option>
                        <option value="hospitality">Luxury Hospitality</option>
                        <option value="event">Bespoke Event</option>
                        <option value="retail">Retail Partnership</option>
                      </select>
                      {errors.purpose && (
                        <p className="text-xs text-red-500 font-gotham">{errors.purpose}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-['Bembo_Std'] text-xs uppercase tracking-wide text-stone-700">Preferred Collection</label>
                      <select
                        name="preferredCollection"
                        value={formData.preferredCollection}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-stone-200 rounded-md text-xs font-gotham text-stone-850 focus:outline-none focus:border-stone-400 cursor-pointer"
                      >
                        <option value="">Select</option>
                        <option value="royal">Royal Collection</option>
                        <option value="classic">Classic Collection</option>
                        <option value="signature">Signature Collection</option>
                        <option value="limited">Limited Edition</option>
                      </select>
                    </div>
                  </div>
 
                  {/* Row 5 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-['Bembo_Std'] text-xs uppercase tracking-wide text-stone-700">Required Delivery Date <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        name="deliveryDate"
                        value={formData.deliveryDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-stone-200 rounded-md text-xs font-gotham text-stone-850 focus:outline-none focus:border-stone-400 cursor-pointer"
                      />
                      {errors.deliveryDate && (
                        <p className="text-xs text-red-500 font-gotham">{errors.deliveryDate}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-['Bembo_Std'] text-xs uppercase tracking-wide text-stone-700">Estimated Quantity <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        placeholder="Write here ..."
                        className="w-full px-4 py-3 border border-stone-200 rounded-md text-xs font-gotham text-stone-850 placeholder-stone-300 focus:outline-none focus:border-stone-400"
                      />
                      {errors.quantity && (
                        <p className="text-xs text-red-500 font-gotham">{errors.quantity}</p>
                      )}
                    </div>
                  </div>
 
                  {/* Row 6 */}
                  <div className="space-y-1.5">
                    <label className="font-['Bembo_Std'] text-xs uppercase tracking-wide text-stone-700">Additional Requirements</label>
                    <textarea
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      placeholder="Write here ..."
                      rows={4}
                      className="w-full px-4 py-3 border border-stone-200 rounded-md text-xs font-gotham text-stone-850 placeholder-stone-300 focus:outline-none focus:border-stone-400 resize-none"
                    />
                    {errors.requirements && (
                      <p className="text-xs text-red-500 font-gotham">{errors.requirements}</p>
                    )}
                  </div>
                </div>
 
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-10 py-3.5 bg-[#C5B382] hover:bg-[#b4a16f] text-white font-gotham text-xs font-semibold uppercase tracking-[0.2em] rounded-full transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting ? 'SUBMITTING...' : 'Submit'}
                  </button>
                </div>
 
              </form>
            </div>
          </div>
 
        </div>
      </div>
    </section>
  );
}
