"use client";

import { useState } from "react";
import Image from "next/image";
import type { Dictionary } from "@/lib/dictionaries";
import type { Ad } from "@/lib/ads";

function AdLabel({ dict }: { dict: Dictionary }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
      {dict.advertisement}
    </span>
  );
}

function AdCloseButton({
  dict,
  onClose,
}: {
  dict: Dictionary;
  onClose: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={dict.closeAd}
      title={dict.closeAd}
      className="flex h-5 w-5 items-center justify-center rounded border border-gray-300 bg-white text-xs text-gray-500 transition-colors hover:border-brand hover:text-brand"
    >
      &#10005;
    </button>
  );
}

export function AdSlot({
  children,
  dict,
  className = "",
}: {
  children: React.ReactNode;
  dict: Dictionary;
  className?: string;
}) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div
      className={`relative flex w-full flex-col items-center gap-2 ${className}`}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <span />
        <AdLabel dict={dict} />
        <AdCloseButton dict={dict} onClose={() => setVisible(false)} />
      </div>
      {children}
    </div>
  );
}

export function AdBanner({
  ad,
  dict,
  className = "",
}: {
  ad: Ad;
  dict: Dictionary;
  className?: string;
}) {
  return (
    <AdSlot dict={dict} className={className}>
      <a
        href={ad.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group block overflow-hidden rounded border border-gray-200 bg-white"
      >
        <div className="relative aspect-[5/2] w-full max-w-md overflow-hidden">
          {ad.image && (
            <Image
              src={ad.image}
              alt={ad.title}
              fill
              sizes="(min-width: 768px) 480px, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
        <div className="px-3 py-2 text-center">
          <span className="text-sm font-semibold text-ink-800 transition-colors group-hover:text-brand">
            {ad.title}
          </span>
        </div>
      </a>
    </AdSlot>
  );
}

export function AdText({
  ad,
  dict,
  className = "",
}: {
  ad: Ad;
  dict: Dictionary;
  className?: string;
}) {
  return (
    <AdSlot dict={dict} className={className}>
      <a
        href={ad.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group block w-full rounded border border-dashed border-gray-300 bg-gray-50 px-4 py-3"
      >
        <span className="block text-sm font-bold text-ink-800 transition-colors group-hover:text-brand">
          {ad.title}
        </span>
        {ad.description && (
          <span className="mt-1 block text-xs leading-relaxed text-gray-500">
            {ad.description}
          </span>
        )}
      </a>
    </AdSlot>
  );
}

export function SponsoredAdCard({
  ad,
  dict,
  className = "",
}: {
  ad: Ad;
  dict: Dictionary;
  className?: string;
}) {
  return (
    <AdSlot dict={dict} className={className}>
      <a
        href={ad.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group block w-full overflow-hidden rounded-b bg-white"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {ad.image && (
            <Image
              src={ad.image}
              alt={ad.title}
              fill
              sizes="(min-width: 1024px) 250px, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          <span className="absolute left-2 top-2 bg-ink-900/90 px-2 py-0.5 text-xs font-bold text-white">
            {dict.sponsored}
          </span>
        </div>
        <div className="p-3">
          <h3 className="line-clamp-3 text-[15px] font-bold leading-snug text-ink-800 transition-colors group-hover:text-brand">
            {ad.title}
          </h3>
          {ad.description && (
            <p className="mt-1.5 line-clamp-2 text-xs text-gray-500">
              {ad.description}
            </p>
          )}
        </div>
      </a>
    </AdSlot>
  );
}