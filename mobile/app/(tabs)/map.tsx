import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { bikerMapTheme } from "@package-shared/index";

import type {
  AllPlaceCategory,
  PlaceCategory,
  PlacesQuery,
} from "@package-shared/index";

import { FloatingMapSheet } from "../../components/shell";
import { MapCanvasWebView } from "../../features/map/ui/MapCanvasWebView";
import { AppText, Button } from "@/components/common";
import { cn } from "@/shared";
import { usePlaceList } from "@/entities/place";

export const placeCategoryOptions: { label: string; value: PlaceCategory }[] = [
  { label: "주유소", value: "gas" },
  { label: "정비소", value: "repair" },
  { label: "카페", value: "cafe" },
  { label: "샵", value: "shop" },
  { label: "휴게/쉼터", value: "rest" },
];

export type MapCategoryFilter = AllPlaceCategory | "route";

export const mapCategoryOptions: Array<{
  label: string;
  value: MapCategoryFilter;
}> = [...placeCategoryOptions, { label: "라이딩 경로", value: "route" }];

export default function MapScreen() {
  const [activeCategory, setActiveCategory] =
    useState<PlacesQuery["category"]>("all");
  const [focusedPlaceId, setFocusedPlaceId] = useState<string | null>(null);
  const { errorMessage, isLoading, places } = usePlaceList({
    category: activeCategory,
  });

  const handleMarkerPressed = (placeId: string) => {
    setFocusedPlaceId(placeId);
  };

  return (
    <View className="bg-bg flex-1">
      <MapCanvasWebView
        activeFilter={activeCategory || "all"}
        focusedPlaceId={focusedPlaceId}
        onMarkerPressed={handleMarkerPressed}
        places={places}
      />

      <SafeAreaView
        className="absolute left-0 right-0 top-0 gap-2.5 px-4.5 pb-3 pt-2"
        edges={["top"]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2.5 py-0.5"
        >
          {placeCategoryOptions.map((option) => {
            const isActive = activeCategory === option.value;

            return (
              <Button
                selected={isActive}
                onPress={() => setActiveCategory(option.value)}
                key={option.value}
              >
                <AppText
                  className={cn(
                    "text-muted text-sm font-bold",
                    isActive && "text-bg"
                  )}
                >
                  {option.label}
                </AppText>
              </Button>
            );
          })}
        </ScrollView>

        {isLoading || errorMessage ? (
          <View className="self-start flex-row items-center gap-2 rounded-full border border-border bg-[rgba(17,19,21,0.9)] px-3 py-2">
            {isLoading ? (
              <ActivityIndicator
                color={bikerMapTheme.colors.accent}
                size="small"
              />
            ) : null}
            {errorMessage ? (
              <AppText className="text-xs font-bold">{errorMessage}</AppText>
            ) : (
              <AppText className="text-xs font-bold">
                장소를 불러오는 중입니다.
              </AppText>
            )}
          </View>
        ) : null}
      </SafeAreaView>

      <FloatingMapSheet sheetContent={<Text>테스트</Text>} />
    </View>
  );
}
