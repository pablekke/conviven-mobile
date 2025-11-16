import { Buffer } from "buffer";

const PLACEHOLDER_COLORS = [
  "#6366F1",
  "#EC4899",
  "#F97316",
  "#14B8A6",
  "#8B5CF6",
  "#22D3EE",
  "#F59E0B",
  "#0EA5E9",
] as const;

const FALLBACK_INITIAL = "?";

function pickColor(key: string): string {
  if (!key) return PLACEHOLDER_COLORS[0];
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0; // force 32bit int
  }
  const index = Math.abs(hash) % PLACEHOLDER_COLORS.length;
  return PLACEHOLDER_COLORS[index];
}

function toBase64(value: string): string {
  if (typeof globalThis !== "undefined" && typeof (globalThis as any).btoa === "function") {
    return (globalThis as any).btoa(value);
  }
  return Buffer.from(value, "utf-8").toString("base64");
}

function buildInitials(firstName?: string, lastName?: string, displayName?: string): string {
  const clean = (value?: string) => value?.trim() ?? "";
  const primary = [clean(firstName), clean(lastName)].filter(Boolean);
  if (primary.length > 0) {
    const initials = primary.map(name => name.charAt(0).toUpperCase()).join("");
    return initials.slice(0, 2) || FALLBACK_INITIAL;
  }

  const words = clean(displayName).split(/\s+/).filter(Boolean);
  if (words.length === 0) return FALLBACK_INITIAL;
  if (words.length === 1) return words[0].charAt(0).toUpperCase() || FALLBACK_INITIAL;
  return `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase();
}

function buildInitialsAvatar(initials: string, key: string): string {
  const color = pickColor(key);
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" rx="96" fill="${color}" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#FFFFFF" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="220" font-weight="700">${initials}</text></svg>`;
  const base64 = toBase64(svg);
  return `data:image/svg+xml;base64,${base64}`;
}

export type ResolveProfilePhotoParams = {
  photoUrl?: string | null;
  userId: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
};

export function resolveProfilePhoto({
  photoUrl,
  userId,
  firstName,
  lastName,
  displayName,
}: ResolveProfilePhotoParams): string {
  const trimmed = photoUrl?.trim();
  if (trimmed) {
    return trimmed;
  }

  const initials = buildInitials(firstName, lastName, displayName);
  const key = userId || displayName || firstName || lastName || initials;
  return buildInitialsAvatar(initials, key);
}
