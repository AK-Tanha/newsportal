"use client";

import { useSyncExternalStore } from "react";
import type { CmsAd } from "@/lib/admin-ads";

const STORAGE_KEY = "rudro-khobor-cms-ads";

let snapshot: CmsAd[] | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function readStorage(): CmsAd[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CmsAd[]) : null;
  } catch {
    return null;
  }
}

function emitChange(): void {
  snapshot = readStorage();
  loaded = true;
  listeners.forEach((listener) => listener());
}

function subscribeAds(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getAdsSnapshot(): CmsAd[] | null {
  if (typeof window === "undefined") return null;
  if (!loaded) {
    snapshot = readStorage();
    loaded = true;
  }
  return snapshot;
}

function getServerSnapshot(): CmsAd[] | null {
  return null;
}

function writeStorage(list: CmsAd[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore quota / availability errors in demo mode
  }
}

export function useStoredAds(): CmsAd[] | null {
  return useSyncExternalStore(subscribeAds, getAdsSnapshot, getServerSnapshot);
}

export function useStoredAdById(id: string | undefined): CmsAd | undefined {
  const stored = useStoredAds();
  if (!id || !stored) return undefined;
  return stored.find((ad) => ad.id === id);
}

export function seedStoredAds(list: CmsAd[]): void {
  if (getAdsSnapshot() !== null) return;
  writeStorage(list);
  emitChange();
}

export function upsertStoredAd(ad: CmsAd): void {
  const list = readStorage() ?? [];
  const index = list.findIndex((item) => item.id === ad.id);
  if (index === -1) {
    list.unshift(ad);
  } else {
    list[index] = ad;
  }
  writeStorage(list);
  emitChange();
}

export function removeStoredAdById(id: string): void {
  const list = readStorage() ?? [];
  writeStorage(list.filter((ad) => ad.id !== id));
  emitChange();
}