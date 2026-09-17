import Image from "next/image";
import { getDictionary } from "@/lib/i18n";
import type { LiveStatus, LiveStream } from "@/lib/live";

export function LiveBadge({
  status,
  liveLabel,
  offlineLabel,
  className = "",
}: {
  status: LiveStatus;
  liveLabel: string;
  offlineLabel: string;
  className?: string;
}) {
  const isLive = status === "live";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow ${className}`}
      style={{ backgroundColor: isLive ? "#e2231a" : "#6b7280" }}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isLive ? "animate-pulse bg-white" : "bg-white/70"
        }`}
      />
      {isLive ? liveLabel : offlineLabel}
    </span>
  );
}

export default async function LivePlayer({
  stream,
  className = "",
}: {
  stream: LiveStream;
  className?: string;
}) {
  const dict = await getDictionary();

  const sourceUrl = stream.streamUrl;
  const isLive = stream.status === "live";
  const canPlay = isLive && sourceUrl !== null;

  return (
    <div className={`relative w-full overflow-hidden bg-black ${className}`}>
      {canPlay ? (
        <video
          controls
          playsInline
          autoPlay
          muted
          loop
          preload="metadata"
          poster={stream.poster}
          className="aspect-video w-full"
        >
          <source src={sourceUrl} type="video/mp4" />
        </video>
      ) : (
        <div className="relative aspect-video w-full">
          <Image
            src={stream.poster}
            alt={stream.title}
            fill
            sizes="(min-width: 1024px) 640px, 100vw"
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-900/70 text-white">
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
              </svg>
            </span>
            <span className="text-sm font-bold text-white">
              {stream.status === "offline" ? dict.offTheAir : dict.noStreamTitle}
            </span>
          </div>
        </div>
      )}
      <LiveBadge
        status={stream.status}
        liveLabel={dict.live}
        offlineLabel={dict.offTheAir}
        className="absolute left-3 top-3"
      />
    </div>
  );
}