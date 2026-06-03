import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { bikerMapTheme, PlacesQuery } from "@package-shared/index";
import type {
  AllPlaceCategory,
  PlaceCategory,
  PlaceListItem,
} from "@package-shared/index";

import { MapCanvasWebView } from "../../features/map/ui/MapCanvasWebView";
import { Button } from "@/components/common";
import { cn } from "@/shared";
import { getPlaceList } from "@/entities/place";

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
  const [places, setPlaces] = useState<PlaceListItem[]>([]);

  const handleMarkerPressed = (placeId: string) => {
    setFocusedPlaceId(placeId);
  };

  const loadPlaceList = async (currentCategory: PlacesQuery["category"]) => {
    const list = await getPlaceList({ category: currentCategory });
    setPlaces(list);
  };

  useEffect(() => {
    loadPlaceList(activeCategory);
  }, [activeCategory]);

  return (
    <View className="bg-bg flex-1">
      <MapCanvasWebView
        activeFilter={activeCategory || "all"}
        focusedPlaceId={focusedPlaceId}
        onMarkerPressed={handleMarkerPressed}
        places={places}
      />

      <SafeAreaView
        style={styles.overlayPanel}
        // className="absolute top-0 left-0 right-0 gap-2.5 pb-3 pt-2 px-4"
        edges={["top"]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
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
                <Text
                  className={cn(
                    "text-muted text-sm font-bold",
                    isActive && "text-bg"
                  )}
                >
                  {option.label}
                </Text>
              </Button>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {/* bottom sheet 예정 */}
    </View>
  );
}

const styles = StyleSheet.create({
  overlayPanel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    gap: 10,
    paddingHorizontal: 18,
    paddingBottom: 12,
    paddingTop: 8,
  },
  filterRow: {
    gap: 10,
    paddingVertical: 2,
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
