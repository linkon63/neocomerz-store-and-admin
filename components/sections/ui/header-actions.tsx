'use client';

import Link from 'next/link';
import { IoSearchOutline, IoHeartOutline, IoHeart } from 'react-icons/io5';
import { LuShoppingBag, LuUser } from 'react-icons/lu';
import { useCart } from '@/app/_providers/cart-provider';
import { useWishlist } from '@/app/_providers/wishlist-provider';
import { useAuth } from '@/app/_providers/auth-provider';

export default function HeaderActions() {
  const { itemCount: cartCount }    = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { user, isAuthenticated }          = useAuth();

  return (
    <>
      {/* Search */}
      <Link
        href="/products"
        className="text-text-primary hover:text-brand-3 transition-colors hidden sm:flex items-center cursor-pointer"
        aria-label="Search products"
      >
        <IoSearchOutline className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
      </Link>

      {/* Wishlist */}
      <Link
        href="/wishlist"
        className="text-text-primary hover:text-brand-3 transition-colors hidden sm:flex items-center relative cursor-pointer"
        aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ''}`}
      >
        {wishlistCount > 0 ? (
          <IoHeart className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-[#C5A880]" />
        ) : (
          <IoHeartOutline className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
        )}
        {wishlistCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-[#C5A880] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
            {wishlistCount > 99 ? '99+' : wishlistCount}
          </span>
        )}
      </Link>

      {/* Cart */}
      <Link
        href="/cart"
        className="text-text-primary hover:text-brand-3 transition-colors relative flex items-center cursor-pointer"
        aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
      >
        <LuShoppingBag className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
        {cartCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-[#C5A880] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </Link>

      {/* Profile */}
      <Link
        href="/profile"
        className="text-text-primary hover:text-brand-3 transition-colors flex items-center cursor-pointer"
        aria-label={isAuthenticated ? 'My account' : 'Sign in'}
      >
        {isAuthenticated ? (
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#C5B382] text-zinc-950 flex items-center justify-center font-bold text-[10px] sm:text-xs overflow-hidden border border-white/20">
            {user?.avatarUrl || (user as any)?.avatar ? (
              <img
                src={user?.avatarUrl || (user as any)?.avatar}
                alt={user?.name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>
                {user?.name
                  ? user.name
                      .trim()
                      .split(/\s+/)
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'U'}
              </span>
            )}
          </div>
        ) : (
          <LuUser className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
        )}
      </Link>
    </>
  );
}
