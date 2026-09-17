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
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-base font-extrabold tracking-tight text-white">
              {adminAppInfo.brandName}
            </p>
            <p className="text-xs text-gray-400">{adminAppInfo.panelLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded p-1 text-gray-400 transition-colors hover:text-white md:hidden"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = navIcons[item.key];
              const active = isActive(pathname, item.href);
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded border-l-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                      active
                        ? "border-brand bg-white/10 text-white"
                        : "border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-100"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span>{item.label}</span>
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
            className="flex items-center gap-2 text-sm font-semibold text-gray-400 transition-colors hover:text-white"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            {adminAppInfo.viewSiteLabel}
          </Link>
        </div>
      </aside>
    </>
  );
}