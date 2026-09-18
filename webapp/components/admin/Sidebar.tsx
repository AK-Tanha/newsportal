"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { adminAppInfo, adminNavItems, type AdminNavKey } from "@/lib/admin";
import { defaultLocale } from "@/lib/locales";
import {
  AdIcon,
  ArticleIcon,
  CloseIcon,
  DashboardIcon,
  ExternalLinkIcon,
  LiveIcon,
  MediaIcon,
  SettingsIcon,
  VideoIcon,
} from "./icons";

const navIcons: Record<AdminNavKey, ComponentType<{ className?: string }>> = {
  dashboard: DashboardIcon,
  articles: ArticleIcon,
  videos: VideoIcon,
  live: LiveIcon,
  advertisements: AdIcon,
  media: MediaIcon,
  settings: SettingsIcon,
};

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col bg-ink-900 transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label={adminAppInfo.panelLabel}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4.5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-white shadow-sm">
              <ArticleIcon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-[15px] font-extrabold leading-tight tracking-tight text-white">
                {adminAppInfo.brandName}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                {adminAppInfo.panelLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white md:hidden"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Menu
          </p>
          <ul className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = navIcons[item.key];
              const active = isActive(pathname, item.href);
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                      active
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-gray-100"
                    }`}
                  >
                    <Icon
                      className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                        active ? "text-brand" : "text-gray-500 group-hover:text-gray-300"
                      }`}
                    />
                    <span>{item.label}</span>
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <Link
            href={`/${defaultLocale}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-lg px-1 py-1 text-sm font-medium text-gray-400 transition-colors hover:text-white"
          >
            <ExternalLinkIcon className="h-4 w-4 text-gray-500" />
            {adminAppInfo.viewSiteLabel}
          </Link>
        </div>
      </aside>
    </>
  );
}