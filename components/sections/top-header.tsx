import { IoIosArrowDown } from "react-icons/io";
import { IoCallOutline, IoLocationOutline } from "react-icons/io5";
import TopSlider from "./ui/topslider";
import data from "@/data/top-header.json";

export default function TopHeader() {
  const { help, selectors } = data;

  return (
    <section className="w-full bg-brand-primary text-white font-medium px-2 sm:px-4 md:px-6">
      <div className="topheader-wrapper">
        <div className="flex items-center justify-between py-1 sm:py-1.5 gap-2 md:gap-4">
          {/* Left Section - Help & Phone */}
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-white">
            <span className="font-gotham text-white hidden sm:inline">
              {help.text}
            </span>
            <span className="font-gotham text-white hidden sm:inline">|</span>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <IoCallOutline className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-gotham text-white text-xs sm:text-sm hidden md:inline">
                {help.phone.label}: {help.phone.full}
              </span>
              <span className="font-gotham text-white text-xs sm:text-sm md:hidden">
                {help.phone.short}
              </span>
            </div>
          </div>
          {/* Center Section - Promotional Text */}
          <div className="hidden lg:block flex-1 max-w-xl mx-4">
            <TopSlider />
          </div>
          {/* Right Section - Location, Language & Currency */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-white">
            {/* Location Icon */}
            <IoLocationOutline className="w-3 h-3 sm:w-4 sm:h-4 hidden sm:inline" />
            {/* Language Selector */}
            <div className="flex items-center gap-0.5">
              <select
                className="bg-transparent text-white border-none outline-none cursor-pointer font-gotham text-xs sm:text-sm appearance-none pr-0.5"
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
              <IoIosArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-0.5">
              <select
                className="bg-transparent text-white border-none outline-none cursor-pointer font-gotham text-xs sm:text-sm appearance-none pr-0.5"
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
              <IoIosArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
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
