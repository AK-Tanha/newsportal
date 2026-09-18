"use client";

import { useSyncExternalStore } from "react";
import type { CmsArticle } from "@/lib/admin-articles";

const STORAGE_KEY = "rudro-khobor-cms-articles";

let snapshot: CmsArticle[] | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function readStorage(): CmsArticle[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CmsArticle[]) : null;
  } catch {
    return null;
  }
}

function emitChange(): void {
  snapshot = readStorage();
  loaded = true;
  listeners.forEach((listener) => listener());
}

function subscribeArticles(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getArticlesSnapshot(): CmsArticle[] | null {
  if (typeof window === "undefined") return null;
  if (!loaded) {
    snapshot = readStorage();
    loaded = true;
  }
  return snapshot;
}

function getServerSnapshot(): CmsArticle[] | null {
  return null;
}

function writeStorage(list: CmsArticle[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore quota / availability errors in demo mode
  }
}

export function useStoredArticles(): CmsArticle[] | null {
  return useSyncExternalStore(
    subscribeArticles,
    getArticlesSnapshot,
    getServerSnapshot,
  );
}

export function useStoredArticleById(
  id: string | undefined,
): CmsArticle | undefined {
  const stored = useStoredArticles();
  if (!id || !stored) return undefined;
  return stored.find((article) => article.id === id);
}

export function seedStoredArticles(list: CmsArticle[]): void {
  if (getArticlesSnapshot() !== null) return;
  writeStorage(list);
  emitChange();
}

export function upsertStoredArticle(article: CmsArticle): void {
  const list = readStorage() ?? [];
  const index = list.findIndex((item) => item.id === article.id);
  if (index === -1) {
    list.unshift(article);
  } else {
    list[index] = article;
  }
  writeStorage(list);
  emitChange();
}

export function removeStoredArticleById(id: string): void {
  const list = readStorage() ?? [];
  writeStorage(list.filter((article) => article.id !== id));
  emitChange();
}