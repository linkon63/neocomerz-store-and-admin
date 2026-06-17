"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { localizeHref } from "@/lib/i18n/navigation";
import { useLocale } from "@/lib/i18n/I18nProvider";

type LinkProps = React.ComponentProps<typeof Link>;

// Drop-in replacement for next/link that prefixes internal hrefs with the
// active storefront locale. Use this instead of next/link inside the storefront.
const LocaleLink = forwardRef<HTMLAnchorElement, LinkProps>(function LocaleLink(
  { href, ...props },
  ref,
) {
  const locale = useLocale();
  const localizedHref = typeof href === "string" ? localizeHref(href, locale) : href;
  return <Link ref={ref} href={localizedHref} {...props} />;
});

export default LocaleLink;
