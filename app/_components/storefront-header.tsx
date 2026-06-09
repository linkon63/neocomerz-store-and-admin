"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { FiHeart, FiSearch, FiShoppingBag, FiUser } from "react-icons/fi";
import humanaLogo from "../../references/logo.png";
import { useAuth } from "./auth-context";
import { useCart } from "./cart-context";
import { useProductSearch } from "./use-product-search";

export default function StorefrontHeader() {
  const { itemCount, items, subtotal } = useCart();
  const { user, isAuthenticated, login, register, forgotPassword, logout, authModal, openAuthModal, closeAuthModal: closeAuthCtx } = useAuth();

  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const closeAuthModal = useCallback(() => {
    closeAuthCtx();
    setAuthError(null);
    setAuthSubmitting(false);
    setForgotSent(false);
  }, [closeAuthCtx]);

  const switchAuthMode = useCallback((mode: "login" | "register" | "forgot-password") => {
    openAuthModal(mode);
    setAuthError(null);
    setForgotSent(false);
  }, [openAuthModal]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { results: searchResults, isSearching } = useProductSearch(searchQuery);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const timer = setTimeout(() => searchInputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !desktopSearchRef.current?.contains(target) &&
        !mobileSearchRef.current?.contains(target)
      ) {
        closeSearch();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [searchOpen, closeSearch]);

  function renderSearchResults(position: string) {
    if (searchQuery.length < 2) return null;

    return (
      <div
        className={`absolute top-full z-50 mt-3 border border-neutral-200 bg-white shadow-xl ${position}`}
      >
        {isSearching ? (
          <p className="px-4 py-3 text-[11px] text-neutral-500">Searching…</p>
        ) : searchResults.length === 0 ? (
          <p className="px-4 py-3 text-[11px] text-neutral-500">No products found</p>
        ) : (
          <ul className="py-2">
            {searchResults.slice(0, 5).map((product) => {
              const featured = product.media?.find((m) => m.isFeatured);
              const imageUrl = featured?.media?.url ?? product.media?.[0]?.media?.url;
              const defaultVariant = product.variants?.find((v) => v.isDefault);
              const price = defaultVariant?.price ?? product.variants?.[0]?.price ?? 0;

              return (
                <li key={product.id}>
                  <Link
                    href={`/shop/${product.slug}`}
                    onClick={closeSearch}
                    className="flex items-center gap-3 px-4 py-2 transition hover:bg-neutral-50"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-neutral-100">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <svg
                          className="h-full w-full p-2 text-neutral-300"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-semibold uppercase tracking-[0.08em]">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-neutral-500">
                        €{Number(price).toFixed(2)}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  const handleForgotPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      const form = e.currentTarget as HTMLFormElement;
      const email = (form.elements.namedItem("forgotEmail") as HTMLInputElement).value;
      await forgotPassword(email);
      setForgotSent(true);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      const form = e.currentTarget as HTMLFormElement;
      if (authModal === "login") {
        const email = (form.elements.namedItem("loginEmail") as HTMLInputElement).value;
        const password = (form.elements.namedItem("loginPassword") as HTMLInputElement).value;
        await login(email, password, rememberMe);
      } else {
        const name = (form.elements.namedItem("regName") as HTMLInputElement).value;
        const email = (form.elements.namedItem("regEmail") as HTMLInputElement).value;
        const password = (form.elements.namedItem("regPassword") as HTMLInputElement).value;
        const confirm = (form.elements.namedItem("regConfirm") as HTMLInputElement).value;
        if (password !== confirm) {
          throw new Error("Passwords do not match");
        }
        await register(name, email, password);
      }
      closeAuthModal();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAuthSubmitting(false);
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-white">
      <section className="bg-black px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
        Join our community and get 10% off every piece
      </section>

      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <nav className="hidden items-center gap-7 text-[11px] font-semibold uppercase tracking-[0.08em] lg:flex">
            <Link href="/">Home</Link>
            <Link href="/shop">Shop</Link>
            <Link href="#">New In</Link>
            <Link href="#">Brands</Link>
            <Link href="#">Archive</Link>
            {isAuthenticated ? (
              <span className="flex items-center gap-4">
                <Link href="/profile" className="text-[11px] font-semibold uppercase tracking-[0.08em] underline underline-offset-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-600">
                    Hi, {user?.name?.split(" ")[0]}
                  </span>
                </Link>
                
              </span>
            ) : (
              <button type="button" onClick={() => switchAuthMode("login")}>
                Log In
              </button>
            )}
          </nav>

          <Link href="/" className="mx-auto lg:mx-0" aria-label="Humana Vintage home">
            <Image
              src={humanaLogo}
              alt="Humana Vintage"
              priority
              className="h-9 w-auto sm:h-11"
            />
          </Link>

          <div className="hidden items-center gap-5 text-lg text-black lg:flex">
            <div ref={desktopSearchRef} className="relative hidden w-[220px] xl:block">
              {searchOpen ? (
                <div className="flex w-full items-center gap-2 border-b border-black pb-1">
                  <FiSearch className="shrink-0 text-sm" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Football jerseys"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Escape" && closeSearch()}
                    className="w-full bg-transparent text-[11px] font-semibold uppercase tracking-[0.08em] outline-none placeholder:text-neutral-400"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="flex w-full items-center justify-end text-lg text-black"
                  aria-label="Open search"
                >
                  <FiSearch />
                </button>
              )}
              {renderSearchResults("right-0 w-80")}
            </div>

            {isAuthenticated ? (
              <Link href="/profile" aria-label="My Profile">
                <FiUser />
              </Link>
            ) : (
              <button type="button" onClick={() => switchAuthMode("login")} aria-label="Open login modal">
                <FiUser />
              </button>
            )}
            <Link href="/wishlist" aria-label="Wishlist">
              <FiHeart />
            </Link>
            <div className="group relative">
              <Link href="/cart" aria-label="Cart" className="relative block">
                <FiShoppingBag />
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              </Link>

              <div className="invisible absolute right-0 top-full w-80 translate-y-3 border border-neutral-200 bg-white p-4 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <h2 className="text-xs font-black uppercase tracking-[0.12em]">Cart Overview</h2>
                {items.length === 0 ? (
                  <p className="mt-4 text-sm text-neutral-500">Your cart is empty.</p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {items.slice(0, 3).map((item) => (
                      <div key={item.slug} className="flex gap-3">
                        <div className="relative h-16 w-16 shrink-0 bg-neutral-50">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-cover p-2"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-black uppercase">{item.name}</p>
                          <p className="mt-1 text-xs text-neutral-500">
                            Qty {item.quantity} · €{item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-neutral-200 pt-3 text-sm font-black">
                      Subtotal: €{subtotal.toFixed(2)}
                    </div>
                  </div>
                )}

                <Link
                  href="/cart"
                  className="mt-4 block bg-black px-4 py-3 text-center text-xs font-black uppercase tracking-[0.12em] text-white"
                >
                  View Cart
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200 px-4 py-2 xl:hidden">
          <div ref={mobileSearchRef} className="relative mx-auto max-w-[520px]">
            {searchOpen ? (
              <div className="flex items-center gap-2 border-b border-black pb-1">
                <FiSearch className="shrink-0 text-sm" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Football jerseys"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && closeSearch()}
                  className="w-full bg-transparent text-[11px] uppercase tracking-[0.08em] outline-none placeholder:text-neutral-400"
                />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="flex w-full items-center gap-2 border-b border-black pb-1 text-[11px] uppercase tracking-[0.08em]"
                >
                  <FiSearch className="shrink-0 text-sm" />
                  <span>Football jerseys</span>
                </button>
              )}
              {renderSearchResults("left-0 right-0")}
          </div>
        </div>
      </header>

      {authModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bembo text-3xl font-bold">
                {authModal === "login" ? "Log in" : authModal === "register" ? "Create account" : "Reset password"}
              </h2>
              <button type="button" className="text-2xl" onClick={closeAuthModal}>
                ×
              </button>
            </div>

            {authModal !== "forgot-password" && (
              <div className="mt-5 grid grid-cols-2 border border-neutral-200 text-sm font-black uppercase">
                <button
                  type="button"
                  onClick={() => switchAuthMode("login")}
                  className={`px-4 py-3 ${authModal === "login" ? "bg-black text-white" : "bg-white text-black"}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => switchAuthMode("register")}
                  className={`px-4 py-3 ${authModal === "register" ? "bg-black text-white" : "bg-white text-black"}`}
                >
                  Register
                </button>
              </div>
            )}

            {authError && (
              <p className="mt-4 text-center text-xs font-semibold text-red-500">{authError}</p>
            )}

            {authModal === "forgot-password" && forgotSent ? (
              <div className="mt-8 text-center">
                <p className="text-sm text-neutral-600">
                  Check your email for reset instructions.
                </p>
                <button
                  type="button"
                  onClick={() => switchAuthMode("login")}
                  className="mt-6 text-xs font-bold uppercase tracking-[0.08em] underline underline-offset-2"
                >
                  Back to login
                </button>
              </div>
            ) : authModal === "forgot-password" ? (
              <form
                onSubmit={handleForgotPasswordSubmit}
                className="mt-6 space-y-4"
              >
                <input
                  name="forgotEmail"
                  type="email"
                  placeholder="Email address"
                  required
                  className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none"
                />
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full bg-black px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white disabled:opacity-50"
                >
                  {authSubmitting ? "Sending…" : "Send reset link"}
                </button>
                <button
                  type="button"
                  onClick={() => switchAuthMode("login")}
                  className="mt-2 block w-full text-center text-xs font-bold uppercase tracking-[0.08em] text-neutral-500 underline underline-offset-2"
                >
                  Back to login
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleAuthSubmit}
                className="mt-6 space-y-4"
              >
                {authModal === "register" && (
                  <input
                    name="regName"
                    type="text"
                    placeholder="Full name"
                    required
                    className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none"
                  />
                )}
                <input
                  name={authModal === "login" ? "loginEmail" : "regEmail"}
                  type="email"
                  placeholder="Email address"
                  required
                  className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none"
                />
                <input
                  name={authModal === "login" ? "loginPassword" : "regPassword"}
                  type="password"
                  placeholder="Password"
                  required
                  minLength={6}
                  className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none"
                />
                {authModal === "register" && (
                  <input
                    name="regConfirm"
                    type="password"
                    placeholder="Confirm password"
                    required
                    minLength={6}
                    className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none"
                  />
                )}

                {authModal === "login" && (
                  <label className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300"
                    />
                    Remember me
                  </label>
                )}

                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full bg-black px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white disabled:opacity-50"
                >
                  {authSubmitting
                    ? "Please wait…"
                    : authModal === "login"
                      ? "Log in"
                      : "Register"}
                </button>

                {authModal === "login" && (
                  <button
                    type="button"
                    onClick={() => switchAuthMode("forgot-password")}
                    className="mt-2 block w-full text-center text-xs font-bold uppercase tracking-[0.08em] text-neutral-500 underline underline-offset-2"
                  >
                    Forgot password?
                  </button>
                )}
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
