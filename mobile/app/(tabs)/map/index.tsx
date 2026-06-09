import { useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { bikerMapTheme } from "@package-shared/index";
import type {
  AllPlaceCategory,
  PlaceCategory,
  PlaceListItem,
  PlacesQuery,
  RouteListItem,
  RouteMapPathItem,
} from "@package-shared/index";

import { AppText, Button } from "@/components/common";
import { cn } from "@/shared";
import { usePlaceList } from "@/entities/place";
import {
  MapListSheetContent,
  MapMarkerClickSheetContent,
} from "@/entities/map";
import { useRouteMapPathsQuery } from "@/entities/route";
import { MapCanvasWebView } from "@/features/map/ui/MapCanvasWebView";
import { FloatingMapSheet } from "@/components/shell";

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
    useState<MapCategoryFilter>("all");
  const [focusedPlaceId, setFocusedPlaceId] = useState<string | null>(null);
  const [detailSheetItem, setDetailSheetItem] = useState<
    | null
    | ({ kind: "place" } & PlaceListItem)
    | ({ kind: "route" } & RouteListItem)
  >(null);
  const placeCategory: PlacesQuery["category"] =
    activeCategory === "route" ? undefined : activeCategory;

  const placesQuery = usePlaceList({
    category: placeCategory,
  });
  const routeMapPathsQuery = useRouteMapPathsQuery();

  const places = placesQuery.data ?? [];
  const routes = routeMapPathsQuery.data ?? [];
  const visiblePlaces = activeCategory === "route" ? [] : places;
  const visibleRoutes =
    activeCategory === "route" || activeCategory === "all" ? routes : [];
  const errorMessage =
    placesQuery.error instanceof Error
      ? placesQuery.error.message
      : routeMapPathsQuery.error instanceof Error
      ? routeMapPathsQuery.error.message
      : null;
  const isLoading = placesQuery.isLoading || routeMapPathsQuery.isLoading;

  const handleMarkerPressed = (place: PlaceListItem) => {
    setFocusedPlaceId(place.id);
    setDetailSheetItem({ kind: "place", ...place });
  };
  const handleRoutePressed = (route: RouteMapPathItem) => {
    setFocusedPlaceId(null);
    setDetailSheetItem({ kind: "route", ...route });
  };

  return (
    <View className="bg-bg flex-1">
      <MapCanvasWebView
        activeFilter={activeCategory || "all"}
        focusedPlaceId={focusedPlaceId}
        onMarkerPressed={handleMarkerPressed}
        onRoutePressed={handleRoutePressed}
        places={visiblePlaces}
        routes={visibleRoutes}
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
          {mapCategoryOptions.map((option) => {
            const isActive = activeCategory === option.value;

            return (
              <Button
                selected={isActive}
                onPress={() => {
                  setActiveCategory((current) =>
                    current === option.value ? "all" : option.value
                  );
                  setFocusedPlaceId(null);
                  setDetailSheetItem(null);
                }}
                key={option.value}
                className={cn(
                  "border border-border bg-panel-soft py-2.5 px-3.5",
                  isActive && "border-accent bg-accent"
                )}
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
        sheetTitle={detailSheetItem ? undefined : "지도 목록"}
        sheetIcon={
          detailSheetItem ? undefined : (
            <Ionicons
              name="map-outline"
              size={18}
              color={bikerMapTheme.colors.text}
            />
          )
        }
        sheetContent={
          detailSheetItem ? (
            <MapMarkerClickSheetContent item={detailSheetItem} />
          ) : (
            <MapListSheetContent activeCategory={placeCategory ?? "all"} />
          )
        }
        contentContainerClassName={detailSheetItem ? "min-h-100" : undefined}
      />
    </View>
  );
}
