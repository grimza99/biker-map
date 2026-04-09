import { PlaceCategory } from "@package-shared/index";

export const quickFilters = [
  { label: "주유소", value: "gas" },
  { label: "정비소", value: "repair" },
  { label: "카페", value: "cafe" },
  { label: "샵", value: "shop" },
  { label: "휴게/쉼터", value: "rest" },
] as const satisfies ReadonlyArray<{ label: string; value: PlaceCategory }>;
