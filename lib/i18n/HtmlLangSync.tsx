"use client";

import { useEffect } from "react";
import type { Locale } from "./config";

// The root layout owns <html lang>, but it cannot see the [locale] segment.
// This keeps document.documentElement.lang in sync with the active locale.
export default function HtmlLangSync({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
