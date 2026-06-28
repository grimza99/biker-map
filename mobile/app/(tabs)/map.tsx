import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { bikerMapTheme } from "@package-shared/index";
import type {
  AllPlaceCategory,
  PlaceCategory,
  PlacesQuery,
} from "@package-shared/index";

import { MapCanvasWebView } from "../../features/map/ui/MapCanvasWebView";
import { Button } from "@/components/common";
import { cn } from "@/shared";
import { usePlaceList } from "@/entities/place";
import { MapListSheetContent } from "@/entities/map";
import { FloatingMapSheet } from "../../components/shell";

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

  const handleMarkerPressed = (place: { id: string }) => {
    setFocusedPlaceId(place.id);
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
        style={styles.overlayPanel}
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

        {isLoading || errorMessage ? (
          <View style={styles.statusBadge}>
            {isLoading ? (
              <ActivityIndicator
                color={bikerMapTheme.colors.accent}
                size="small"
              />
            ) : null}
            {errorMessage ? (
              <Text style={styles.statusText}>{errorMessage}</Text>
            ) : (
              <Text style={styles.statusText}>장소를 불러오는 중입니다.</Text>
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
  statusBadge: {
    alignSelf: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: "rgba(17, 19, 21, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusText: {
    color: bikerMapTheme.colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
});
