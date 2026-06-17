"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/I18nProvider";
import { localizeHref, setLocaleCookie, stripLocale } from "@/lib/i18n/navigation";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = useLocale();

  function switchTo(locale: Locale) {
    if (locale === active) return;
    setLocaleCookie(locale);
    const query = searchParams.toString();
    const target = localizeHref(stripLocale(pathname), locale) + (query ? `?${query}` : "");
    router.replace(target);
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border border-neutral-300 p-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${className}`}
    >
      {locales.map((locale) => {
        const isActive = locale === active;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => switchTo(locale)}
            aria-current={isActive ? "true" : undefined}
            aria-label={locale === "en" ? "English" : "Italiano"}
            className={`rounded-full px-2.5 py-1 transition ${
              isActive
                ? "bg-black text-white"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
}
