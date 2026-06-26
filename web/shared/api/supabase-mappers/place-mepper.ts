import {
  PlaceCategory,
  PlaceDetail,
  PlaceListItem,
} from "@package-shared/types/place";
import {
  getRecordNumber,
  getRecordString,
  getRecordStringArray,
  SupabaseRecord,
} from "../supabase-record";

export const placeCategories = new Set<PlaceCategory>([
  "gas",
  "repair",
  "cafe",
  "shop",
  "rest",
]);
function toPlaceCategory(value: string) {
  return placeCategories.has(value as PlaceCategory)
    ? (value as PlaceCategory)
    : null;
}

export function mapPlaceListItem(row: SupabaseRecord): PlaceListItem | null {
  const id = getRecordString(row, ["id"]);
  const name = getRecordString(row, ["name"]);
  const category = toPlaceCategory(getRecordString(row, ["category"]));
  const address = getRecordString(row, ["address"]);
  const lat = getRecordNumber(row, ["lat", "latitude"], Number.NaN);
  const lng = getRecordNumber(row, ["lng", "longitude"], Number.NaN);
  const naverPlaceUrl = getRecordString(row, [
    "naver_place_url",
    "naverPlaceUrl",
  ]);

  if (
    !id ||
    !category ||
    !name ||
    !address ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    !naverPlaceUrl
  ) {
    return null;
  }

  return {
    id,
    name,
    category,
    address,
    lat,
    lng,
    naverPlaceUrl,
  };
}

export function mapPlaceDetail(row: SupabaseRecord): PlaceDetail | null {
  const listItem = mapPlaceListItem(row);
  if (!listItem) {
    return null;
  }

  return {
    ...listItem,
    phone: getRecordString(row, ["phone"], "") || undefined,
    description: getRecordString(row, ["description"], "") || undefined,
    images: getRecordStringArray(row, ["images"]),
  };
}
