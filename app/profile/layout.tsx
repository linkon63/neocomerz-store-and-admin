// app/profile/layout.tsx
'use client';

import Link from 'next/link';
import { ReactNode, useState } from 'react';
import { useAuth } from '@/app/_components/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { FiUser, FiShoppingBag, FiMapPin, FiSettings, FiLogOut, FiHeart, FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    { href: '/profile/dashboard', icon: FiUser, label: 'Dashboard' },
    { href: '/profile/orders', icon: FiShoppingBag, label: 'Orders' },
    { href: '/profile/cart', icon: FiShoppingCart, label: 'Cart' },
    { href: '/profile/wishlist', icon: FiHeart, label: 'Wishlist' },
    { href: '/profile/address', icon: FiMapPin, label: 'Address Book' },
    { href: '/profile/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-lg font-bold text-gray-900">My Account</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar Navigation - Responsive */}
        <aside 
          className={`
            fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:flex-shrink-0
          `}
        >
          <nav className="flex flex-col p-6 space-y-2 h-full overflow-y-auto">
            <div className="lg:hidden flex justify-end mb-4">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Close menu"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <h2 className="text-xl font-bold mb-6 text-gray-900 hidden lg:block">My Account</h2>
            
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="text-lg" />
                  {item.label}
                </Link>
              );
            })}

            <div className="pt-6 mt-6 border-t border-gray-200">
              <button 
                onClick={() => {
                  handleLogout();
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium"
              >
                <FiLogOut className="text-lg" />
                Logout
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content Area - Responsive */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}