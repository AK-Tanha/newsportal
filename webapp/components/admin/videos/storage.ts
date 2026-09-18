"use client";

import { useSyncExternalStore } from "react";
import type { CmsVideo } from "@/lib/admin-videos";

const STORAGE_KEY = "rudro-khobor-cms-videos";

let snapshot: CmsVideo[] | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function readStorage(): CmsVideo[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CmsVideo[]) : null;
  } catch {
    return null;
  }
}

function emitChange(): void {
  snapshot = readStorage();
  loaded = true;
  listeners.forEach((listener) => listener());
}

function subscribeVideos(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getVideosSnapshot(): CmsVideo[] | null {
  if (typeof window === "undefined") return null;
  if (!loaded) {
    snapshot = readStorage();
    loaded = true;
  }
  return snapshot;
}

function getServerSnapshot(): CmsVideo[] | null {
  return null;
}

function writeStorage(list: CmsVideo[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore quota / availability errors in demo mode
  }
}

export function useStoredVideos(): CmsVideo[] | null {
  return useSyncExternalStore(
    subscribeVideos,
    getVideosSnapshot,
    getServerSnapshot,
  );
}

export function useStoredVideoById(
  id: string | undefined,
): CmsVideo | undefined {
  const stored = useStoredVideos();
  if (!id || !stored) return undefined;
  return stored.find((video) => video.id === id);
}

export function seedStoredVideos(list: CmsVideo[]): void {
  if (getVideosSnapshot() !== null) return;
  writeStorage(list);
  emitChange();
}

export function upsertStoredVideo(video: CmsVideo): void {
  const list = readStorage() ?? [];
  const index = list.findIndex((item) => item.id === video.id);
  if (index === -1) {
    list.unshift(video);
  } else {
    list[index] = video;
  }
  writeStorage(list);
  emitChange();
}

export function removeStoredVideoById(id: string): void {
  const list = readStorage() ?? [];
  writeStorage(list.filter((video) => video.id !== id));
  emitChange();
}