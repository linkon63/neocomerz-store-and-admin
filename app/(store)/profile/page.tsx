"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

import AccountDetailsView from "./_components/account-details";
import OrdersView from "./_components/orders-view";
import AddressBookView from "./_components/address-book";
import WishlistView from "./_components/wishlist-view";
import NotificationsView from "./_components/notifications-view";
import TrackOrderView from "./_components/track-order";

type ProfileTab = "details" | "orders" | "address" | "wishlist" | "notifications" | "track";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1";

function ProfilePageContent() {
  const { user, isAuthenticated, loading, logout, refreshUser, setShowAuthModal } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as ProfileTab | null;

  const [activeTab, setActiveTab] = useState<ProfileTab>("details");
  const [hasOrders, setHasOrders] = useState(false);

  useEffect(() => {
    if (tabParam && ["details", "orders", "address", "wishlist", "notifications", "track"].includes(tabParam)) {
      setActiveTab(tabParam);
    } else {
      setActiveTab("details");
    }
  }, [tabParam]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [loading, isAuthenticated, setShowAuthModal]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
      
      const token = getCustomerToken();
      if (token) {
        fetch(`${BASE_URL}/orders/my-orders`, { headers: { Authorization: `Bearer ${token}` } })
          .then((res) => (res.ok ? res.json() : []))
          .then((data) => setHasOrders(Array.isArray(data) ? data.length > 0 : (data?.data?.length ?? 0) > 0))
          .catch(() => {});
      }
    }
  }, [isAuthenticated, refreshUser]);

  return (
    <div className="relative min-h-[calc(100vh-140px)] bg-white flex flex-col justify-between">
      {!isAuthenticated ? (
        <main className="min-h-[70vh] flex items-center justify-center bg-[#FAF9F5] px-4 py-16">
          {loading ? (
            <FiLoader className="w-8 h-8 text-[#C5B382] animate-spin" />
          ) : (
            <div className="flex flex-col items-center gap-5 text-center max-w-md mx-auto animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-[#C5B382]/15 flex items-center justify-center text-[#C5B382] mb-1">
                <FiUser className="w-8 h-8" />
              </div>
              <div>
                <h1 className="font-['Bembo_Std'] text-3xl font-normal text-zinc-900 tracking-wide">
                  Sign in to your account
                </h1>
                <p className="mt-2 font-sans text-xs sm:text-sm text-zinc-500 leading-relaxed">
                  Please sign in to view your profile details, order history, address book and wishlist.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="bg-zinc-900 hover:bg-stone-800 text-white font-sans text-xs font-bold tracking-[0.18em] uppercase py-4 px-10 rounded-full shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign In
              </button>
            </div>
          )}
        </main>
      ) : (
        <div className="relative w-full flex-1 flex flex-col bg-white min-h-[calc(100vh-140px)]">
          <div
            className="absolute inset-y-0 left-0 hidden lg:block bg-[#F7F6F2] border-r border-stone-200/80 pointer-events-none z-0"
            style={{ width: "calc(50vw - min(100vw, 1400px) * 0.25 + 16px)" }}
          />

          <div className="relative max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 z-10 flex-1 flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch flex-1 gap-8 lg:gap-0">
              
              <aside className="lg:col-span-3 bg-[#F7F6F2] lg:bg-transparent p-4 sm:p-6 lg:py-12 lg:px-0 rounded-2xl lg:rounded-none border border-stone-200/80 lg:border-none shadow-xs lg:shadow-none pr-0 lg:pr-8 flex flex-col justify-between w-full">
                <div className="w-full">
                  <h1 className="font-['Bembo_Std'] text-2xl sm:text-3xl lg:text-4xl font-normal text-zinc-900 tracking-wide mb-4 lg:mb-8 text-center lg:text-left">
                    Profile
                  </h1>
                  
                  <nav 
                    className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 gap-1.5 lg:space-y-1.5 lg:gap-0 snap-x snap-mandatory font-sans"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    aria-label="Profile navigation"
                  >
                    {[
                      { key: "details", label: "ACCOUNT DETAILS", icon: <FiUser /> },
                      { key: "orders", label: "MY ORDERS", icon: <FiShoppingBag />, badge: hasOrders },
                      { key: "address", label: "ADDRESS", icon: <FiMapPin /> },
                      { key: "wishlist", label: "WISHLIST", icon: <FiHeart /> },
                      { key: "notifications", label: "NOTIFICATIONS", icon: <FiBell /> },
                      { key: "track", label: "TRACK ORDER", icon: <FiSearch /> },
                      { key: "logout", label: "LOGOUT", icon: <FiLogOut />, isLogout: true }
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
                          window.history.pushState(null, "", `/profile?tab=${item.key}`);
                        }}
                        className={`group flex items-center justify-between px-4 sm:px-5 py-3 rounded-xl transition-all duration-200 text-[11px] sm:text-xs tracking-[0.14em] font-semibold cursor-pointer shrink-0 snap-start text-left focus-outline-none focus-visible:ring-2 focus-visible:ring-[#C5B382] focus-visible:ring-offset-1 ${
                          item.isLogout
                            ? "text-red-500 hover:bg-red-50 lg:hidden"
                            : activeTab === item.key
                            ? "bg-[#C5B382] text-zinc-950 font-bold shadow-xs scale-[1.01]"
                            : "text-zinc-650 hover:bg-stone-200/50 hover:text-zinc-950"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-sm sm:text-base transition-colors ${activeTab === item.key ? "text-zinc-950" : "text-stone-500 group-hover:text-zinc-900"}`}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge && !item.isLogout && (
                          <span className="w-2 h-2 rounded-full bg-[#C5B382] ml-2 shrink-0 animate-pulse" />
                        )}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="pt-6 mt-8 border-t border-stone-200/80 hidden lg:block mr-2">
                  <button
                    onClick={() => {
                      logout();
                      toast.success("Logged out successfully.");
                    }}
                    className="flex items-center gap-3 px-5 py-3 w-full rounded-xl text-red-600 hover:bg-red-50/80 transition-colors font-sans text-xs tracking-[0.14em] font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  >
                    <FiLogOut className="text-base text-red-500" />
                    <span>LOGOUT</span>
                  </button>
                </div>
              </aside>

              <section className="lg:col-span-9 bg-white py-6 lg:py-12 pl-0 lg:pl-12 min-h-[600px] w-full transition-all">
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
