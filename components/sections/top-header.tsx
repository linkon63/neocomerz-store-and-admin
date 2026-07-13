"use client";

import { useState, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoCallOutline, IoLocationOutline } from "react-icons/io5";
import TopSlider from "./ui/topslider";
import { fetchShopSettings } from "@/lib/shop-api";
import data from "@/data/data.json";

export default function TopHeader() {
  const { help, selectors } = data;
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

  const phoneFull = shopSettings?.contactNumber 
    ? (typeof shopSettings.contactNumber === 'object' ? shopSettings.contactNumber.full : shopSettings.contactNumber)
    : help.phone.full;
    
  const phoneShort = shopSettings?.contactNumber 
    ? (typeof shopSettings.contactNumber === 'object' ? shopSettings.contactNumber.short : shopSettings.contactNumber)
    : help.phone.short;

  const branchAddress = shopSettings?.branchAddress || "";

  return (
    <section className="w-full bg-sage-gray text-white font-medium px-2 sm:px-4 md:px-6 py-0.5 relative">
      <div className="topheader-wrapper max-w-360 mx-auto relative">
        <div className="flex items-center justify-between py-1 sm:py-2.5 gap-2 md:gap-4">
          {/* Left Section - Help & Phone */}
          <div className="flex items-center gap-1 sm:gap-2 text-xs text-white z-10">
            <span className="font-['Gotham'] text-white hidden sm:inline">
              {help.text}
            </span>
            <span className="font-['Gotham'] text-white hidden sm:inline">|</span>
            <div className="flex items-center gap-1 sm:gap-1.5 text-white">
              <IoCallOutline className="w-3.5 h-3.5 text-white" />
              <span className="font-['Gotham'] text-white text-xs sm:text-sm hidden md:inline">
                {help.phone.label} {phoneFull}
              </span>
              <span className="font-['Gotham'] text-white text-xs sm:text-sm md:hidden">
                {phoneShort}
              </span>
            </div>
            {branchAddress && (
              <>
                <span className="font-['Gotham'] text-white hidden sm:inline">|</span>
                <span className="font-['Gotham'] text-white hidden sm:inline text-xs truncate max-w-[200px]" title={branchAddress}>
                  {branchAddress}
                </span>
              </>
            )}
          </div>

          {/* Center Section - Promotional Text (Absolutely Centered) */}
          <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl z-0">
            <TopSlider />
          </div>

          {/* Right Section - Location, Language & Currency */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white z-10">
            {/* Location Icon */}
            <IoLocationOutline className="w-4 h-4 text-white hidden sm:inline" />
            
            {/* Language Selector */}
            <div className="flex items-center gap-0.5 cursor-pointer">
              <select
                className="bg-transparent text-white border-none outline-none cursor-pointer font-['Gotham'] text-xs sm:text-sm appearance-none pr-0.5"
                defaultValue={selectors.language.default}
              >
                {selectors.language.options.map((option: { value: string; label: string }) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="text-black bg-white"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <IoIosArrowDown className="w-2.5 h-2.5 text-white" />
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-0.5 cursor-pointer">
              <select
                className="bg-transparent text-white border-none outline-none cursor-pointer font-['Gotham'] text-xs appearance-none pr-0.5"
                defaultValue={selectors.currency.default}
              >
                {selectors.currency.options.map((option: { value: string; label: string }) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="text-black bg-white"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <IoIosArrowDown className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
        </div>

        {/* Mobile Slider - Below main content */}
        <div className="lg:hidden pb-1">
          <TopSlider />
        </div>
      </div>
    </section>
  );
}


