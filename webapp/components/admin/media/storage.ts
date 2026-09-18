"use client";

import { useSyncExternalStore } from "react";
import type { CmsMedia } from "@/lib/admin-media";
import { removeMediaFile } from "./files";

const STORAGE_KEY = "rudro-khobor-cms-media";

let snapshot: CmsMedia[] | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function readStorage(): CmsMedia[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CmsMedia[]) : null;
  } catch {
    return null;
  }
}

function emitChange(): void {
  snapshot = readStorage();
  loaded = true;
  listeners.forEach((listener) => listener());
}

function subscribeMedia(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getMediaSnapshot(): CmsMedia[] | null {
  if (typeof window === "undefined") return null;
  if (!loaded) {
    snapshot = readStorage();
    loaded = true;
  }
  return snapshot;
}

function getServerSnapshot(): CmsMedia[] | null {
  return null;
}

function writeStorage(list: CmsMedia[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore quota / availability errors in demo mode
  }
}

export function useStoredMedia(): CmsMedia[] | null {
  return useSyncExternalStore(
    subscribeMedia,
    getMediaSnapshot,
    getServerSnapshot,
  );
}

export function seedStoredMedia(list: CmsMedia[]): void {
  if (getMediaSnapshot() !== null) return;
  writeStorage(list);
  emitChange();
}

export function upsertStoredMedia(media: CmsMedia): void {
  const list = readStorage() ?? [];
  const index = list.findIndex((item) => item.id === media.id);
  if (index === -1) {
    list.unshift(media);
  } else {
    list[index] = media;
  }
  writeStorage(list);
  emitChange();
}

export function removeStoredMediaById(id: string): void {
  const list = readStorage() ?? [];
  const removed = list.find((media) => media.id === id);
  if (removed?.localFile) {
    void removeMediaFile(id);
  }
  writeStorage(list.filter((media) => media.id !== id));
  emitChange();
}