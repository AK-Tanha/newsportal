import Image from "next/image";
import Link from "next/link";
import { lang } from "next/root-params";
import type { Video } from "@/lib/videos";
import { getCategory } from "@/lib/news";
import { getDictionary } from "@/lib/i18n";

function PlayIcon({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const box = size === "sm" ? "h-8 w-8" : "h-12 w-12";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <span
      className={`flex ${box} items-center justify-center rounded-full bg-brand text-white shadow-md transition-transform group-hover:scale-110 ${className}`}
    >
      <svg
        className={`${icon} ml-0.5`}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}

export async function VideoCard({ video }: { video: Video }) {
  const locale = await lang();
  const dict = await getDictionary();
  return (
    <Link
      href={`/${locale}/videos/${video.slug}`}
      className="group block overflow-hidden rounded-b bg-white"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={video.image}
          alt={video.title}
          fill
          sizes="(min-width: 1024px) 380px, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/25" />
        <PlayIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        <span
          className="absolute left-2 top-2 px-1.5 py-0.5 text-[10px] font-bold text-white"
          style={{
            backgroundColor: getCategory(video.category)?.color ?? "#e2231a",
          }}
        >
          {video.categoryName}
        </span>
        <span className="absolute bottom-2 right-2 bg-ink-900/90 px-1.5 py-0.5 text-[11px] font-bold text-white">
          {video.duration}
        </span>
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-ink-800 transition-colors group-hover:text-brand">
          {video.title}
        </h3>
        <p className="mt-1.5 text-xs text-gray-500">
          {video.views} {dict.readers}
        </p>
      </div>
    </Link>
  );
}

export async function SideVideo({ video }: { video: Video }) {
  const locale = await lang();
  return (
    <Link
      href={`/${locale}/videos/${video.slug}`}
      className="group flex gap-3 border-b border-gray-100 py-3 last:border-0"
    >
      <div className="relative h-[68px] w-[100px] shrink-0 overflow-hidden">
        <Image
          src={video.image}
          alt={video.title}
          fill
          sizes="100px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
          <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <span className="absolute bottom-0.5 right-0.5 bg-ink-900/90 px-1 py-0.5 text-[9px] font-bold text-white">
          {video.duration}
        </span>
      </div>
      <h3 className="line-clamp-3 text-sm font-semibold leading-snug text-ink-800 transition-colors group-hover:text-brand">
        {video.title}
      </h3>
    </Link>
  );
}