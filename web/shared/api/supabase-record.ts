import { formatRelativeLabel } from "@shared/lib";
import { buildCursor, getCursorOffset } from "./request";

export type SupabaseRecord = Record<string, unknown>;

function readPath(record: SupabaseRecord, path: string) {
  return path.split(".").reduce<unknown>((value, key) => {
    if (
      value &&
      typeof value === "object" &&
      key in (value as Record<string, unknown>)
    ) {
      return (value as Record<string, unknown>)[key];
    }

    return undefined;
  }, record);
}

function firstValue(record: SupabaseRecord, paths: string[]) {
  for (const path of paths) {
    const value = readPath(record, path);
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
}
/**
 * @description Supabase 레코드에서 주어진 경로들 중 첫 번째로 유효한 값을 문자열로 반환합니다. 값이 문자열이거나 숫자, 불리언인 경우 문자열로 변환하여 반환하며, 유효한 값이 없는 경우에는 fallback 값을 반환합니다.
 * @param record Supabase 레코드 객체
 * @param paths 값을 읽어올 경로들의 배열 (예: ["name", "user.name"])
 * @param fallback 유효한 값이 없는 경우 반환할 기본값 (기본값: "")
 * @returns 경로들 중 첫 번째로 유효한 값을 문자열로 반환하거나, 유효한 값이 없는 경우 fallback 반환
 */
export function getRecordString(
  record: SupabaseRecord,
  paths: string[],
  fallback = ""
) {
  const value = firstValue(record, paths);
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

export function getRecordNumber(
  record: SupabaseRecord,
  paths: string[],
  fallback = 0
) {
  const value = firstValue(record, paths);
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

export function getRecordBoolean(
  record: SupabaseRecord,
  paths: string[],
  fallback = false
) {
  const value = firstValue(record, paths);
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }
  }

  return fallback;
}

export function getRecordStringArray(record: SupabaseRecord, paths: string[]) {
  const value = firstValue(record, paths);
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (typeof item === "number" || typeof item === "boolean") {
          return String(item);
        }

        return null;
      })
      .filter((item): item is string => Boolean(item));
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function getRecordArray(record: SupabaseRecord, paths: string[]) {
  const value = firstValue(record, paths);
  return Array.isArray(value) ? value : [];
}

export function getRecordRelativeLabel(
  record: SupabaseRecord,
  paths: string[],
  fallback = ""
) {
  const value = firstValue(record, paths);
  if (typeof value === "string" && value.trim()) {
    const isExplicitLabel = paths.some(
      (path) => path === "time_label" || path === "timeLabel"
    );
    if (isExplicitLabel) {
      return value;
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return formatRelativeLabel(parsed);
    }

    return value;
  }

  return fallback;
}

export function paginateByCursor<T>(
  items: T[],
  cursor?: string,
  limit?: number
) {
  const offset = getCursorOffset(cursor);
  const pageSize = limit && limit > 0 ? limit : items.length;
  const pagedItems = items.slice(offset, offset + pageSize);
  const nextOffset = offset + pagedItems.length;
  const nextCursor = nextOffset < items.length ? buildCursor(nextOffset) : null;

  return {
    items: pagedItems,
    meta: {
      nextCursor,
      total: items.length,
    },
  };
}
