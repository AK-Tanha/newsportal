"use client";

import { useEffect, useState } from "react";
import type { CmsMedia } from "@/lib/admin-media";
import { getMediaFileObjectUrl } from "./files";

export function useMediaSrc(media: CmsMedia): string {
  const [resolvedUrl, setResolvedUrl] = useState(media.url);
  const src = media.localFile ? resolvedUrl : media.url;

  useEffect(() => {
    if (!media.localFile) return;
    let objectUrl: string | null = null;
    let active = true;
    getMediaFileObjectUrl(media.id).then((url) => {
      if (!active) {
        if (url) URL.revokeObjectURL(url);
        return;
      }
      if (url) {
        objectUrl = url;
        setResolvedUrl(url);
      }
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [media.id, media.localFile]);

  return src;
}