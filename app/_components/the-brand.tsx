"use client";

import Link from "@/components/LocaleLink";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function TheBrand() {
  const { t } = useI18n();

  return (
    <section className="Thebrand-wrapper bg-[#ffd3f3] px-4 py-14 text-center sm:px-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em]">{t("home.brand.eyebrow")}</p>
      <h2 className="mt-4 font-bembo text-3xl font-bold sm:text-4xl">
        {t("home.brand.heading")}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-6">
        {t("home.brand.body")}
      </p>
      <Link
        href="/shop"
        className="mt-7 inline-flex bg-black px-6 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
      >
        {t("home.brand.cta")}
      </Link>
    </section>
  );
}
