'use client';

import { IoSearchOutline, IoHeartOutline } from "react-icons/io5";
import { LuShoppingBag, LuUser } from "react-icons/lu";

export default function HeaderActions() {
  return (
    <>
      <button
        className="text-text-primary hover:text-brand-3 transition-colors hidden sm:block cursor-pointer"
        aria-label="Search"
      >
        <IoSearchOutline className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        className="text-text-primary hover:text-brand-3 transition-colors hidden sm:block cursor-pointer"
        aria-label="Wishlist"
      >
        <IoHeartOutline className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        className="text-text-primary hover:text-brand-3 transition-colors relative cursor-pointer"
        aria-label="Shopping Cart"
      >
        <LuShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />

        <span className="absolute -top-1 -right-1 bg-white text-black text-xs rounded-full w-4 h-4 flex items-center justify-center">
          0
        </span>
      </button>

      <button
        className="text-text-primary hover:text-brand-3 transition-colors cursor-pointer"
        aria-label="User Account"
      >
        <LuUser className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </>
  );
}