"use client";

import { useSyncExternalStore } from "react";
import { getDefaultCmsLiveStream, type CmsLiveStream } from "@/lib/admin-live";

const STORAGE_KEY = "rudro-khobor-cms-live";

let snapshot: CmsLiveStream | null | undefined;
let initialized = false;
const listeners = new Set<() => void>();

function readStorage(): CmsLiveStream | null | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return undefined;
    if (raw === "null") return null;
    return JSON.parse(raw) as CmsLiveStream;
  } catch {
    return null;
  }
}

function emitChange(): void {
  snapshot = readStorage();
  initialized = true;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): CmsLiveStream | null | undefined {
  if (typeof window === "undefined") return undefined;
  if (!initialized) {
    const read = readStorage();
    snapshot = read === undefined ? getDefaultCmsLiveStream() : read;
    initialized = true;
  }
  return snapshot;
}

function getServerSnapshot(): CmsLiveStream | null {
  return getDefaultCmsLiveStream();
}

function writeStorage(value: CmsLiveStream | null): void {
  if (typeof window === "undefined") return;
  try {
    if (value === null) {
      window.localStorage.setItem(STORAGE_KEY, "null");
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    }
  } catch {
    // ignore quota / availability errors in demo mode
  }
}

export function useStoredLiveStream(): CmsLiveStream | null | undefined {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function seedStoredLiveStream(defaultStream: CmsLiveStream): void {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(STORAGE_KEY) !== null) return;
  writeStorage(defaultStream);
  emitChange();
}

export function setStoredLiveStream(stream: CmsLiveStream): void {
  writeStorage(stream);
  emitChange();
}

export function removeStoredLiveStream(): void {
  writeStorage(null);
  emitChange();
}