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
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-3 px-4 md:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="rounded p-1 text-ink-900 transition-colors hover:bg-gray-100 md:hidden"
        >
          <MenuIcon className="h-6 w-6" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500">
            Admin / {current.label}
          </p>
          <h1 className="truncate text-lg font-extrabold text-ink-900">
            {current.label}
          </h1>
        </div>

        <div className="hidden items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2 lg:flex">
          <SearchIcon className="h-5 w-5 text-gray-400" />
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
          className="hidden items-center gap-2 rounded bg-ink-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink-800 md:inline-flex"
        >
          <ExternalLinkIcon className="h-4 w-4" />
          {adminAppInfo.viewSiteLabel}
        </Link>

        <div className="flex items-center gap-3 border-l border-gray-200 pl-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
            {adminUser.initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-ink-900">{adminUser.name}</p>
            <p className="text-xs text-gray-500">{adminUser.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}