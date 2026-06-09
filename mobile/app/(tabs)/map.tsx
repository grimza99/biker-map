import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
import { MapListSheetContent } from "@/entities/map";

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
  const placesQuery = usePlaceList({
    category: activeCategory,
  });
  const places = placesQuery.data ?? [];
  const errorMessage =
    placesQuery.error instanceof Error ? placesQuery.error.message : null;
  const isLoading = placesQuery.isLoading;

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
        className="gap-2.5 px-4.5 pb-3 pt-2"
        edges={["top"]}
        style={styles.filterOverlay}
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
                style={[styles.filterChip, isActive && styles.filterChipActive]}
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

      <FloatingMapSheet
        sheetTitle="지도 목록"
        sheetIcon={
          <Ionicons
            name="map-outline"
            size={18}
            color={bikerMapTheme.colors.text}
          />
        }
        sheetContent={<MapListSheetContent activeCategory={activeCategory} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filterOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    zIndex: 10,
  },
  filterChip: {
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panelSoft,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterChipActive: {
    borderColor: bikerMapTheme.colors.accent,
    backgroundColor: bikerMapTheme.colors.accent,
  },
});
