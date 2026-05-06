import { PlaceCategory } from "@package-shared/index";

export const placeCategoryOptions: { label: string; value: PlaceCategory }[] = [
  { label: "전체", value: "all" },
  { label: "주유소", value: "gas" },
  { label: "정비소", value: "repair" },
  { label: "카페", value: "cafe" },
  { label: "샵", value: "shop" },
  { label: "휴게/쉼터", value: "rest" },
];

export type MapCategoryFilter = PlaceCategory | "route" | "all";

export const mapCategoryOptions: Array<{
  label: string;
  value: MapCategoryFilter;
}> = [...placeCategoryOptions, { label: "라이딩 경로", value: "route" }];
