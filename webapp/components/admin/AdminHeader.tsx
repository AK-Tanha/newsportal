"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminAppInfo, adminNavItems, adminUser } from "@/lib/admin";
import { defaultLocale } from "@/lib/locales";
import { ExternalLinkIcon, MenuIcon, SearchIcon } from "./icons";

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
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 md:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="rounded-lg p-1.5 text-ink-900 transition-colors hover:bg-gray-100 md:hidden"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
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

        <div className="flex items-center gap-3 border-l border-gray-200 pl-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shadow-sm">
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