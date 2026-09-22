"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminAppInfo, adminNavItems, adminUser } from "@/lib/admin";
import { defaultLocale } from "@/lib/locales";
import {
  ArticleIcon,
  ExternalLinkIcon,
  MenuIcon,
  SearchIcon,
} from "./icons";

export default function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const current =
    adminNavItems.find(
      (item) =>
        (item.href === "/admin"
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`)),
    ) ?? adminNavItems[0];

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200/80 bg-white/90 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 md:h-16 md:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="rounded-lg p-1.5 text-ink-900 transition-colors hover:bg-gray-100 md:hidden"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:hidden">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-white shadow-sm">
            <ArticleIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold leading-tight tracking-tight text-ink-900">
              {adminAppInfo.brandName}
            </p>
            <p className="truncate text-[11px] font-medium uppercase tracking-wider text-gray-400">
              {adminAppInfo.panelLabel}
            </p>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 sm:block">
          <p className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
            <span>{adminAppInfo.panelLabel}</span>
            <span aria-hidden className="text-gray-300">/</span>
            <span className="font-semibold text-gray-600">{current.label}</span>
          </p>
          <h1 className="truncate text-lg font-bold tracking-tight text-ink-900">
            {current.label}
          </h1>
        </div>

        <div className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 transition-colors focus-within:border-gray-300 focus-within:bg-white lg:flex">
          <SearchIcon className="h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search…"
            className="w-44 bg-transparent text-sm text-ink-900 outline-none placeholder:text-gray-400"
          />
        </div>

        <Link
          href={`/${defaultLocale}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-ink-900 transition-colors hover:bg-gray-50 md:inline-flex"
        >
          <ExternalLinkIcon className="h-4 w-4 text-gray-400" />
          {adminAppInfo.viewSiteLabel}
        </Link>

        <div className="flex items-center gap-2.5 border-l border-gray-200 pl-2.5 sm:gap-3 sm:pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white shadow-sm sm:h-9 sm:w-9 sm:text-sm">
            {adminUser.initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-ink-900">{adminUser.name}</p>
            <p className="text-xs font-medium text-gray-400">{adminUser.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}