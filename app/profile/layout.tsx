// app/profile/layout.tsx
'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { useAuth } from '@/app/_components/auth-context';
import { useRouter } from 'next/navigation';
import { FiUser, FiShoppingBag, FiMapPin, FiSettings, FiLogOut, FiHeart, FiShoppingCart } from 'react-icons/fi';

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="h-[calc(100vh-80px)] flex bg-gray-50 overflow-hidden">
      {/* Sidebar Navigation - Fixed, no scroll */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <nav className="flex flex-col p-6 space-y-2 h-full">
          <h2 className="text-xl font-bold mb-6 text-gray-900">My Account</h2>
          
          <Link 
            href="/profile/dashboard" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium"
          >
            <FiUser className="text-lg" />
            Dashboard
          </Link>
          
          <Link 
            href="/profile/orders" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium"
          >
            <FiShoppingBag className="text-lg" />
            Orders
          </Link>
          
          <Link 
            href="/profile/cart" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium"
          >
            <FiShoppingCart className="text-lg" />
            Cart
          </Link>
          
          <Link 
            href="/profile/wishlist" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium"
          >
            <FiHeart className="text-lg" />
            Wishlist
          </Link>
          
          <Link 
            href="/profile/address" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium"
          >
            <FiMapPin className="text-lg" />
            Address Book
          </Link>
          
          <Link 
            href="/profile/settings" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium"
          >
            <FiSettings className="text-lg" />
            Settings
          </Link>

          <div className="pt-6 mt-6 border-t border-gray-200">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              <FiLogOut className="text-lg" />
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area - Only this scrolls */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}