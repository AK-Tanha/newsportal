import { notFound } from "next/navigation";
import { defaultLocale, isLocale } from "@/lib/locales";
import { getDictionaryStatic } from "@/lib/dictionaries";

export type { Dictionary } from "@/lib/dictionaries";
export { getDictionaryStatic, dictionaries } from "@/lib/dictionaries";

export async function getDictionary() {
  const locale = defaultLocale;
  if (!isLocale(locale)) notFound();
  return getDictionaryStatic(locale);
}

export type { Locale } from "@/lib/locales";
export { locales } from "@/lib/locales";
