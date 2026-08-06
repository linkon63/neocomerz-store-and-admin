"use client";

import { useState, useEffect } from "react";
import { IoCallOutline, IoLocationOutline } from "react-icons/io5";
import TopSlider from "./ui/topslider";
import { fetchShopSettings } from "@/lib/shop-api";
import data from "@/data/data.json";

export default function TopHeader() {
  const { help } = data;
  const [shopSettings, setShopSettings] = useState<any>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await fetchShopSettings();
        if (settings) {
          setShopSettings(settings);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
    loadSettings();
  }, []);

  // contactNumber comes as { entries: [{title, value}] } from the API
  const contactEntries: { title: string; value: string }[] =
    Array.isArray(shopSettings?.contactNumber?.entries)
      ? shopSettings.contactNumber.entries
      : Array.isArray(shopSettings?.contactNumber)
      ? shopSettings.contactNumber
      : [];

  const primaryPhone = contactEntries[0]?.value || help.phone.full;
  const primaryPhoneShort = contactEntries[0]?.value || help.phone.short;

  return (
    <section className="w-full bg-sage-gray text-white font-medium px-2 sm:px-4 md:px-6 py-0.5 relative">
      <div className="topheader-wrapper max-w-360 mx-auto relative">
        <div className="flex items-center justify-between py-1 sm:py-2.5 gap-2 md:gap-4">
          {/* Left Section - Help & Phone */}
          <div className="flex items-center gap-1 sm:gap-2 text-[11px] sm:text-xs text-white z-10">
            <span className="font-['Gotham'] text-white hidden sm:inline">
              {help.text}
            </span>
            <span className="font-['Gotham'] text-white hidden sm:inline">|</span>
            <div className="flex items-center gap-1 sm:gap-1.5 text-white">
              <IoCallOutline className="w-3.5 h-3.5 text-white" />
              <span className="font-['Gotham'] text-white hidden md:inline">
                {help.phone.label} {primaryPhone}
              </span>
              <span className="font-['Gotham'] text-white md:hidden">
                {primaryPhoneShort}
              </span>
            </div>
          </div>

          {/* Center Section - Promotional Text (Absolutely Centered) */}
          <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl z-0">
            <TopSlider slogan={shopSettings?.slogan} />
          </div>

          {/* Right Section - Location */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-white z-10">
            <IoLocationOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            <span className="font-['Gotham'] text-white text-[11px] sm:text-xs">
              Pan Pacific Sonargaon
            </span>
          </div>
        </div>

        {/* Mobile Slider - Below main content */}
        <div className="lg:hidden pb-1">
          <TopSlider slogan={shopSettings?.slogan} />
        </div>
      </div>
    </section>
  );
}


