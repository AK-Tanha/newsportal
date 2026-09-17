import type { Video } from "@/lib/videos";

export default function VideoPlayer({
  video,
  className = "",
}: {
  video: Video;
  className?: string;
}) {
  return (
    <div className={`relative w-full overflow-hidden bg-black ${className}`}>
      <video
        controls
        playsInline
        preload="metadata"
        poster={video.image}
        className="aspect-video w-full"
      >
        <source src={video.videoUrl} type="video/mp4" />
      </video>
    </div>
  );
}