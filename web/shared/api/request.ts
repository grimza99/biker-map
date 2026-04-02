import type { PlaceViewport } from "@package-shared/types/place";

export function getStringParam(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);
  return value?.trim() || undefined;
}

export function getNumberParam(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function getBooleanParam(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

export function getViewportParam(searchParams: URLSearchParams, key = "viewport"): PlaceViewport | undefined {
  const raw = searchParams.get(key);
  if (!raw) {
    return undefined;
  }

  const [minLng, minLat, maxLng, maxLat] = raw.split(",").map((value) => Number(value.trim()));
  if ([minLng, minLat, maxLng, maxLat].some((value) => !Number.isFinite(value))) {
    return undefined;
  }

  return { minLng, minLat, maxLng, maxLat };
}

export function getCursorOffset(cursor?: string) {
  if (!cursor) {
    return 0;
  }

  const match = cursor.match(/^(?:cursor:)?(\d+)$/);
  if (!match) {
    return 0;
  }

  return Number(match[1]);
}

export function buildCursor(offset: number) {
  return `cursor:${offset}`;
}
