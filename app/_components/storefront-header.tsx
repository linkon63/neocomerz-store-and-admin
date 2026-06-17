"use client";

import Image from "next/image";
import Link from "@/components/LocaleLink";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiHeart, FiLogOut, FiMenu, FiSearch, FiShoppingBag, FiUser, FiX } from "react-icons/fi";
import humanaLogo from "../../references/logo.png";
import { useAuth } from "./auth-context";
import { useCart } from "./cart-context";
import { useWishlist } from "./wishlist-context";
import { useProductSearch } from "./use-product-search";
import { resolveImageUrl } from "@/app/_components/products";
import { useFetchSettings } from "@/hooks/useFetchSettings";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatCurrency } from "@/lib/i18n/format";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function StorefrontHeader() {
  const { itemCount, items, subtotal } = useCart();
  const { itemCount: wishlistItemCount } = useWishlist();
  const { user, login, register, logout } = useAuth();
  const { data, isLoading } = useFetchSettings();
  const { t, locale } = useI18n();

  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { results: searchResults, isSearching } = useProductSearch(searchQuery);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFormError("");
    setIsSubmitting(false);
  }, [authMode]);

  useEffect(() => {
    if (!authMode) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setAuthMode(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [authMode]);

  function renderSearchResults(position: string) {
    if (searchQuery.length < 2) return null;

    return (
      <div
        className={`absolute top-full z-50 mt-3 border border-neutral-200 bg-white shadow-xl ${position}`}
      >
        {isSearching ? (
          <p className="px-4 py-3 text-[11px] text-neutral-500">{t("search.searching")}</p>
        ) : searchResults.length === 0 ? (
          <p className="px-4 py-3 text-[11px] text-neutral-500">{t("search.noResults")}</p>
        ) : (
          <ul className="py-2">
            {searchResults.slice(0, 5).map((product) => {
              const featured = product.media?.find((m) => m.isFeatured);
              const rawUrl = featured?.media?.url ?? product.media?.[0]?.media?.url;
              const imageUrl = resolveImageUrl(rawUrl);
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
                        {formatCurrency(Number(price), locale)}
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

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (authMode === "register" && password !== confirmPassword) {
      setFormError(t("auth.passwordsNoMatch"));
      return;
    }
    if (password.length < 6) {
      setFormError(t("auth.passwordMin"));
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      setAuthMode(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("auth.genericError"));
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <div className="sticky top-0 z-50 bg-white">
      {/* {
        data?.slogan && <section className="bg-black px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
          {data.slogan}
        </section>
      } */}


      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center text-black lg:hidden"
            aria-label={t("account.openMenu")}
          >
            <FiMenu className="h-6 w-6" />
          </button>

          <nav className="hidden items-center gap-7 text-[11px] font-semibold uppercase tracking-[0.08em] lg:flex">
            <Link href="/">{t("nav.home")}</Link>
            <Link href="/shop">{t("nav.shop")}</Link>
            <Link href="/about">{t("nav.about")}</Link>
            <Link href="/contact">{t("nav.contact")}</Link>
          </nav>

          <Link href="/" className="mx-auto lg:mx-0" aria-label={data?.shopName || "Store"}>
            {isLoading ? (
              <div className="h-9 w-32 animate-pulse rounded bg-neutral-200 sm:h-11" />
            ) : (
              <Image
                src={data?.logo || humanaLogo}
                alt={data?.shopName || "Store Logo"}
                priority
                width={150}
                height={44}
                className="h-9 w-auto sm:h-11"
              />
            )}
          </Link>

          <div className="hidden items-center gap-5 text-lg text-black lg:flex">
            <div ref={desktopSearchRef} className="relative hidden min-w-[220px] xl:block">
              {searchOpen ? (
                <div className="flex items-center gap-2 border-b border-black pb-1">
                  <FiSearch className="shrink-0 text-sm" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t("search.placeholder")}
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
                  className="flex w-full justify-end text-lg text-black"
                  aria-label={t("search.open")}
                >
                  <FiSearch />
                </button>
              )}
              {renderSearchResults("right-0 w-80")}
            </div>
            {user ? (
              <div className="group relative">
                <Link
                  href="/profile"
                  className="block px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] hover:bg-neutral-50"
                >
                  <button
                    type="button"
                    aria-label={t("account.menu")}
                    className="flex items-center gap-1.5 text-sm font-bold"
                  >
                    <FiUser />
                    <span className="max-w-[90px] truncate text-[11px] uppercase tracking-[0.06em]">
                      {user.name.split(" ")[0]}
                    </span>
                  </button>
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                aria-label={t("account.openLogin")}
              >
                <FiUser />
              </button>
            )}

            <Link href="/wishlist" aria-label={t("wishlist.label")} className="relative block">
              <FiHeart />
              {mounted && wishlistItemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                  {wishlistItemCount}
                </span>
              )}
            </Link>

            <div className="group relative">
              <Link href="/cart" aria-label={t("cart.title")} className="relative block">
                <FiShoppingBag />
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {mounted ? itemCount : 0}
                </span>
              </Link>

              <div className="invisible absolute right-0 top-full w-80 translate-y-3 border border-neutral-200 bg-white p-4 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <h2 className="text-xs font-black uppercase tracking-[0.12em]">{t("cart.overview")}</h2>
                {items.length === 0 ? (
                  <p className="mt-4 text-sm text-neutral-500">{t("cart.empty")}</p>
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
                            {t("cart.qty")} {item.quantity} · {formatCurrency(item.price, locale)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-neutral-200 pt-3 text-sm font-black">
                      {t("cart.subtotal")}: {formatCurrency(subtotal, locale)}
                    </div>
                  </div>
                )}
                <Link
                  href="/cart"
                  className="mt-4 block bg-black px-4 py-3 text-center text-xs font-black uppercase tracking-[0.12em] text-white"
                >
                  {t("cart.viewCart")}
                </Link>
              </div>
            </div>

            <LanguageSwitcher className="ml-1" />
          </div>

          <div className="flex items-center gap-4 text-lg text-black lg:hidden">
            <Link href="/wishlist" aria-label={t("wishlist.label")} className="relative block">
              <FiHeart />
              {mounted && wishlistItemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                  {wishlistItemCount}
                </span>
              )}
            </Link>

            <Link href="/cart" aria-label={t("cart.title")} className="relative block">
              <FiShoppingBag />
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {mounted ? itemCount : 0}
              </span>
            </Link>
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
                className="flex w-full justify-end text-lg text-black"
                aria-label="Open search"
              >
                <FiSearch />
              </button>
            )}
            {renderSearchResults("left-0 right-0")}
          </div>
        </div>
      </header>

      {authMode && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAuthMode(null);
          }}
        >
          <div ref={modalRef} className="w-full max-w-md bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">
                {authMode === "login" ? t("auth.logIn") : t("auth.createAccount")}
              </h2>
              <button
                type="button"
                className="text-2xl leading-none"
                onClick={() => setAuthMode(null)}
                aria-label={t("common.close")}
              >
                ×
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 border border-neutral-200 text-sm font-black uppercase">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`px-4 py-3 transition ${authMode === "login" ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-50"
                  }`}
              >
                {t("auth.loginTab")}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={`px-4 py-3 transition ${authMode === "register" ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-50"
                  }`}
              >
                {t("auth.registerTab")}
              </button>
            </div>

            {formError && (
              <div className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="mt-5 space-y-4" noValidate>
              {authMode === "register" && (
                <input
                  type="text"
                  placeholder={t("auth.fullName")}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black"
                />
              )}
              <input
                type="email"
                placeholder={t("auth.email")}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black"
              />
              <input
                type="password"
                placeholder={t("auth.password")}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black"
              />
              {authMode === "register" && (
                <input
                  type="password"
                  placeholder={t("auth.confirmPassword")}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black"
                />
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-neutral-800 disabled:bg-neutral-400"
              >
                {isSubmitting
                  ? authMode === "login"
                    ? t("auth.loggingIn")
                    : t("auth.creatingAccount")
                  : authMode === "login"
                    ? t("auth.logIn")
                    : t("auth.register")}
              </button>
            </form>

            {authMode === "login" && (
              <p className="mt-4 text-center text-xs text-neutral-500">
                {t("auth.noAccount")}{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className="font-bold underline hover:text-black"
                >
                  {t("auth.createOne")}
                </button>
              </p>
            )}
          </div>
        </div>
      )}

      <div className={`fixed inset-0 z-[100] lg:hidden transition-all duration-300 ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileMenuOpen(false)}
        />

        <div className={`fixed inset-y-0 left-0 flex w-full max-w-[300px] flex-col bg-white p-6 shadow-2xl transition-transform duration-300 ease-in-out transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              aria-label={t("account.homeAria")}
            >
              <Image
                src={humanaLogo}
                alt="Humana Vintage"
                priority
                className="h-8 w-auto"
              />
            </Link>
            <button
              type="button"
              className="text-2xl text-black hover:text-neutral-600 focus:outline-none transition-transform duration-200 hover:rotate-90"
              onClick={() => setMobileMenuOpen(false)}
              aria-label={t("account.closeMenu")}
            >
              <FiX />
            </button>
          </div>

          <nav className="flex flex-col gap-6 py-8 text-sm font-semibold uppercase tracking-[0.1em] text-black">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="transition-all duration-200 hover:text-neutral-500 hover:pl-2"
            >
              {t("nav.home")}
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="transition-all duration-200 hover:text-neutral-500 hover:pl-2"
            >
              {t("nav.shop")}
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="transition-all duration-200 hover:text-neutral-500 hover:pl-2"
            >
              {t("nav.about")}
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="transition-all duration-200 hover:text-neutral-500 hover:pl-2"
            >
              {t("nav.contact")}
            </Link>
            <LanguageSwitcher className="pt-2" />
          </nav>

          <div className="mt-auto border-t border-neutral-100 pt-6">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiUser className="text-lg text-black shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-[0.06em] text-neutral-500">{t("account.loggedInAs")}</p>
                    <p className="text-xs font-bold uppercase tracking-[0.06em] text-black truncate">
                      {user.name}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block border border-black bg-white px-3 py-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-black hover:bg-neutral-50 transition"
                  >
                    {t("account.profile")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center justify-center gap-1.5 border border-red-200 bg-red-50 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-red-600 hover:bg-red-100 transition"
                  >
                    <FiLogOut className="text-xs" />
                    {t("account.signOut")}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthMode("login");
                }}
                className="flex w-full items-center justify-center gap-2 border border-black bg-black px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white hover:bg-neutral-800 transition"
              >
                <FiUser className="text-sm" />
                {t("account.signInRegister")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}