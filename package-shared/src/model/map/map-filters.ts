import { AllPlaceCategory, PlaceCategory } from "../../types/place";

export const placeCategoryOptions: {
  label: string;
  value: AllPlaceCategory;
}[] = [
  { label: "전체", value: "all" },
  { label: "주유소", value: "gas" },
  { label: "정비소", value: "repair" },
  { label: "카페", value: "cafe" },
  { label: "샵", value: "shop" },
];

export const placeCrudCategoryOptions: {
  label: string;
  value: PlaceCategory;
}[] = placeCategoryOptions.filter(
  (option): option is { label: string; value: PlaceCategory } =>
    option.value !== "all"
);

export type MapCategoryFilter = AllPlaceCategory | "route";

export const mapCategoryOptions: Array<{
  label: string;
  value: MapCategoryFilter;
}> = [...placeCategoryOptions, { label: "경로", value: "route" }];
