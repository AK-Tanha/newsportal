"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Dictionary } from "@/lib/dictionaries";
import type { Ad } from "@/lib/ads";

const SESSION_KEY = "jago-popup-shown";
const DELAY_MS = 5000;

export default function PopupAd({ ad, dict }: { ad: Ad; dict: Dictionary }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const timer = window.setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setVisible(true);
    }, DELAY_MS);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={() => setVisible(false)}
    >
      <div
        className="animate-pop-in relative w-full max-w-md overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={dict.advertisement}
      >
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label={dict.closeAd}
          title={dict.closeAd}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded bg-black/60 text-sm text-white transition-colors hover:bg-brand"
        >
          &#10005;
        </button>

        <a
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-white"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            {ad.image && (
              <Image
                src={ad.image}
                alt={ad.title}
                fill
                sizes="(min-width: 768px) 448px, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
          </div>
          <div className="px-5 py-4">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              {dict.advertisement}
            </span>
            <h3 className="mt-1 text-lg font-bold leading-snug text-ink-900 transition-colors group-hover:text-brand">
              {ad.title}
            </h3>
            {ad.description && (
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {ad.description}
              </p>
            )}
            <span className="mt-3 inline-block rounded bg-brand px-4 py-1.5 text-sm font-semibold text-white">
              {dict.more}
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}