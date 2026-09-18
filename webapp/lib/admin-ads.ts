import {
  adSources,
  localizeAd,
  type AdPlacement,
  type AdSource,
  type AdType,
} from "@/lib/ads";

export interface CmsAd {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: AdType;
  positions: AdPlacement[];
  image: string;
  targetUrl: string;
  alt: string;
  active: boolean;
  startDate: string;
  endDate: string;
}

export interface CmsAdInput {
  slug: string;
  name: string;
  description: string;
  type: AdType;
  positions: AdPlacement[];
  image: string;
  targetUrl: string;
  alt: string;
  active: boolean;
  startDate: string;
  endDate: string;
}

export interface AdPositionOption {
  placement: AdPlacement;
  label: string;
}

export const adPositionOptions: AdPositionOption[] = [
  { placement: "header", label: "Top header" },
  { placement: "below-hero", label: "Below hero" },
  { placement: "sidebar", label: "Sidebar" },
  { placement: "in-feed", label: "In feed" },
  { placement: "in-content", label: "In article" },
  { placement: "popup", label: "Popup" },
];

export function adPositionLabel(placement: AdPlacement): string {
  return adPositionOptions.find((option) => option.placement === placement)
    ?.label ?? placement;
}

export function adTypeLabel(type: AdType): string {
  return type === "banner" ? "Banner" : type === "text" ? "Text" : "Sponsored";
}

export function adStatusLabel(active: boolean): string {
  return active ? "Active" : "Inactive";
}

export function adStatusColor(active: boolean): string {
  return active ? "#059669" : "#9ca3af";
}

export function isValidHttpUrl(value: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function seedDate(index: number): string {
  const date = new Date(Date.UTC(2026, 8, 18 - index));
  return date.toISOString().slice(0, 10);
}

function toCmsAd(index: number, source: AdSource): CmsAd {
  const ad = localizeAd(source, "en");
  return {
    id: source.slug,
    slug: source.slug,
    name: ad.title,
    description: ad.description ?? "",
    type: ad.type,
    positions: [...ad.placements],
    image: ad.image ?? "",
    targetUrl: ad.link,
    alt: ad.title,
    active: true,
    startDate: seedDate(index),
    endDate: "2026-10-01",
  };
}

export function getCmsAdSeeds(): CmsAd[] {
  const derived = adSources.map((source, index) => toCmsAd(index, source));
  const extras: CmsAd[] = [
    {
      id: "summer-ice-cream-campaign-2026",
      slug: "summer-ice-cream-campaign-2026",
      name: "Summer ice cream — cool down with 20% off",
      description:
        "Limited-time offer across all participating outlets this summer.",
      type: "banner",
      positions: ["below-hero"],
      image: "https://picsum.photos/seed/ad-icecream/1200/400",
      targetUrl: "https://example.com/ice-cream-summer",
      alt: "Summer ice cream campaign",
      active: true,
      startDate: "2026-09-01",
      endDate: "2026-10-31",
    },
    {
      id: "winter-fashion-sale-2026",
      slug: "winter-fashion-sale-2026",
      name: "Winter fashion sale — warm layers, big savings",
      description:
        "Seasonal collection preview for the upcoming winter campaign.",
      type: "text",
      positions: ["sidebar"],
      image: "",
      targetUrl: "https://example.com/winter-fashion",
      alt: "Winter fashion sale",
      active: false,
      startDate: "2026-11-01",
      endDate: "2026-12-31",
    },
  ];
  return [...derived, ...extras];
}