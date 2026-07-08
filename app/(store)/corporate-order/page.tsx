import React from 'react';
import LuxuryHero from '@/components/sections/luxury-hero-banner';
import TrustFeatures from '@/components/sections/trust-features';
import Brands from '@/components/sections/brands';
import InquiryForm from '@/components/sections/inquiry-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Corporate Orders | London Tea Exchange',
  description: 'Curated tea experiences, corporate gifting, and bespoke tea collections for distinguished organizations.',
};

export default function CorporateOrderPage() {
  return (
    <main className="flex-grow bg-white w-full">
      <LuxuryHero />
      <TrustFeatures />
      <Brands variant="vertical" />
      <InquiryForm />
    </main>
  );
}
