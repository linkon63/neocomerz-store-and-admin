"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  FiUser,
  FiShoppingBag,
  FiMapPin,
  FiHeart,
  FiBell,
  FiSearch,
  FiLogOut,
  FiLoader
} from "react-icons/fi";
import { toast } from "sonner";

import { useAuth } from "@/app/_providers/auth-provider";
import { getCustomerToken } from "@/lib/storefront-api";

import AuthView from "./_components/auth-view";
import AccountDetailsView from "./_components/account-details";
import OrdersView from "./_components/orders-view";
import AddressBookView from "./_components/address-book";
import WishlistView from "./_components/wishlist-view";
import NotificationsView from "./_components/notifications-view";
import TrackOrderView from "./_components/track-order";

type ProfileTab = "details" | "orders" | "address" | "wishlist" | "notifications" | "track";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1";

function ProfilePageContent() {
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as ProfileTab | null;

  // Active subcomponents router state
  const [activeTab, setActiveTab] = useState<ProfileTab>("details");
  const [hasOrders, setHasOrders] = useState(false);

  // Read tab parameter from URL queries if active
  useEffect(() => {
    if (tabParam && ["details", "orders", "address", "wishlist", "notifications", "track"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Sync profile details on page load / authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
      
      // Check if user has orders to show the inline dot badge
      const token = getCustomerToken();
      if (token) {
        fetch(`${BASE_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } })
          .then((res) => (res.ok ? res.json() : []))
          .then((data) => setHasOrders(Array.isArray(data) && data.length > 0))
          .catch(() => {});
      }
    }
  }, [isAuthenticated, refreshUser]);

  // Unified single return block ensuring modular state rendering and zero DOM level function calls
  return (
    <div className="relative min-h-screen bg-white">
      {!isAuthenticated ? (
        <AuthView />
      ) : (
        <div className="relative min-h-screen bg-white">
          {/* Background Split Screen Panels */}
          <div className="absolute inset-0 pointer-events-none hidden lg:grid grid-cols-1 lg:grid-cols-12 z-0">
            <div className="lg:col-span-3 bg-[#F7F6F2] lg:border-r lg:border-stone-200/60 h-full" />
            <div className="lg:col-span-9 bg-white h-full" />
          </div>

          <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 z-10 py-8 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
              
              {/* LEFT SIDEBAR PANEL */}
              <aside className="lg:col-span-3 bg-[#F7F6F2] lg:bg-transparent p-4 sm:p-6 lg:p-0 rounded-2xl lg:rounded-none border border-stone-200/60 lg:border-none shadow-[0_1px_2px_rgba(0,0,0,0.05)] lg:shadow-none pr-0 lg:pr-8 flex flex-col justify-between gap-6 lg:gap-12 lg:h-[calc(100vh-200px)] lg:sticky lg:top-28 w-full">
                <div className="mr-0 lg:mr-4">
                  <h1 className="font-['Bembo_Std'] text-3xl lg:text-5xl font-normal text-zinc-850 tracking-wide mb-4 lg:mb-8 text-center lg:text-left">
                    Profile
                  </h1>
                  
                  <nav 
                    className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 gap-2 lg:space-y-2 lg:gap-0 snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {[
                      { key: "details", label: "ACCOUNT DETAILS", icon: <FiUser /> },
                      { key: "orders", label: "MY ORDERS", icon: <FiShoppingBag />, badge: hasOrders },
                      { key: "address", label: "ADDRESS", icon: <FiMapPin /> },
                      { key: "wishlist", label: "WISHLIST", icon: <FiHeart /> },
                      { key: "notifications", label: "NOTIFICATIONS", icon: <FiBell /> },
                      { key: "track", label: "TRACK ORDER", icon: <FiSearch /> },
                      { key: "logout", label: "Logout", icon: <FiLogOut />, isLogout: true }
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => {
                          if (item.isLogout) {
                            logout();
                            toast.success("Logged out successfully.");
                            return;
                          }
                          setActiveTab(item.key as ProfileTab);
                        }}
                        className={`flex items-center gap-3 px-6 py-3.5 rounded-full transition-all duration-300 font-sans text-xs tracking-widest font-bold cursor-pointer shrink-0 snap-start text-left ${
                          item.isLogout
                            ? "text-red-500 hover:bg-red-50 lg:hidden"
                            : activeTab === item.key
                            ? "bg-[#C5B382] text-[#1A1A1A] shadow-xs"
                            : "text-zinc-650 hover:bg-stone-100/80 hover:text-black"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm">{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge && !item.isLogout && (
                          <span className="text-[#C5B382] font-bold text-sm ml-1">•</span>
                        )}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Logout Row at Bottom of Sidebar - Desktop only */}
                <div className="pt-6 border-t border-stone-200/80 hidden lg:block mr-4">
                  <button
                    onClick={() => {
                      logout();
                      toast.success("Logged out successfully.");
                    }}
                    className="flex items-center gap-3 px-6 py-3.5 w-full rounded-full text-red-500 hover:bg-red-50 transition-colors font-sans text-xs tracking-widest font-bold cursor-pointer"
                  >
                    <FiLogOut className="text-sm" />
                    Logout
                  </button>
                </div>
              </aside>

              {/* RIGHT DETAILS CONTENT PANEL */}
              <section className="lg:col-span-9 bg-white py-6 lg:py-12 pl-0 lg:pl-8 min-h-[600px] transition-all">
                {activeTab === "details" && <AccountDetailsView />}
                {activeTab === "orders" && <OrdersView />}
                {activeTab === "address" && <AddressBookView />}
                {activeTab === "wishlist" && <WishlistView />}
                {activeTab === "notifications" && <NotificationsView />}
                {activeTab === "track" && <TrackOrderView />}
              </section>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F5]">
        <div className="flex flex-col items-center gap-4">
          <FiLoader className="w-8 h-8 text-[#C5B382] animate-spin" />
          <span className="font-['Bembo_Std'] text-zinc-650 italic text-lg font-light tracking-wide">Loading...</span>
        </div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}
