"use client";

import { useSyncExternalStore } from "react";
import {
  getDefaultCmsSettings,
  type CmsSettings,
} from "@/lib/admin-settings";

const STORAGE_KEY = "rudro-khobor-cms-settings";

let snapshot: CmsSettings | null | undefined;
let initialized = false;
let fallback: CmsSettings | null = null;
const listeners = new Set<() => void>();

function resolveDefault(): CmsSettings {
  fallback ??= getDefaultCmsSettings();
  return fallback;
}

function readStorage(): CmsSettings | null | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return undefined;
    return JSON.parse(raw) as CmsSettings;
  } catch {
    return undefined;
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

function getSnapshot(): CmsSettings {
  if (typeof window === "undefined") return resolveDefault();
  if (!initialized) {
    snapshot = readStorage();
    initialized = true;
  }
  return snapshot ?? resolveDefault();
}

function getServerSnapshot(): CmsSettings {
  return resolveDefault();
}

function writeStorage(value: CmsSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore quota / availability errors in demo mode
  }
}

export function useStoredSettings(): CmsSettings {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function persistSettings(settings: CmsSettings): void {
  writeStorage(settings);
  emitChange();
}

export function resetSettings(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore availability errors in demo mode
  }
  emitChange();
}