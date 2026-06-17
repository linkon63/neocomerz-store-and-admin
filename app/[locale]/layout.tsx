import { notFound } from "next/navigation";
import StorefrontChrome from "@/app/_components/storefront-chrome";
import { isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import HtmlLangSync from "@/lib/i18n/HtmlLangSync";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const messages = await getDictionary(locale);

  return (
    <I18nProvider locale={locale} messages={messages}>
      <HtmlLangSync locale={locale} />
      <StorefrontChrome>{children}</StorefrontChrome>
    </I18nProvider>
  );
}
