import { ActivityIndicator, ScrollView, View } from "react-native";

import {
  bikerMapTheme,
  type MapCategoryFilter,
  type PlacesQuery,
} from "@package-shared/index";
import { usePlaceList } from "@/entities/place";
import { RouteCard, useRouteListQuery } from "@/entities/route";
import { PlaceCard } from "@/entities/place/ui/PlaceCard";
import { AppText } from "@/components/common";

type MapListSheetContentProps = {
  activeCategory: MapCategoryFilter;
};

const SHEET_PAGE_SIZE = 8;

export function MapListSheetContent({
  activeCategory,
}: MapListSheetContentProps) {
  const placeCategory: PlacesQuery["category"] =
    activeCategory === "route" ? undefined : activeCategory;
  const shouldShowPlaces = activeCategory !== "route";
  const shouldShowRoutes = activeCategory === "all" || activeCategory === "route";

  const placesQuery = usePlaceList({
    category: placeCategory,
    limit: SHEET_PAGE_SIZE,
  });
  const routesQuery = useRouteListQuery({
    limit: SHEET_PAGE_SIZE,
  });

  const isInitialLoading =
    (shouldShowPlaces && placesQuery.isLoading) ||
    (shouldShowRoutes && routesQuery.isLoading);
  const errorMessage =
    (shouldShowPlaces ? placesQuery.error?.message : undefined) ??
    (shouldShowRoutes ? routesQuery.error?.message : undefined);

  if (isInitialLoading) {
    return (
      <View className="h-full gap-3">
        <View className="items-center justify-center rounded-2xl border border-border bg-panel-solid py-8">
          <ActivityIndicator color={bikerMapTheme.colors.accent} size="small" />
          <AppText className="mt-3 text-[13px] font-bold" tone="muted">
            지도 목록을 불러오는 중입니다.
          </AppText>
        </View>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View className="h-full gap-3">
        <View className="rounded-2xl border border-danger/40 bg-panel-solid p-4">
          <AppText className="text-[13px] font-bold text-danger">
            {errorMessage}
          </AppText>
        </View>
      </View>
    );
  }

  const places = placesQuery.data ?? [];
  const routes = routesQuery.data?.data.items ?? [];
  const hasContent =
    (shouldShowPlaces && places.length > 0) ||
    (shouldShowRoutes && (routesQuery.data?.meta?.total || 0) > 0);

  return (
    <View className="h-full gap-3">
      <ScrollView
        className="h-full max-h-185"
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4 pb-4">
          {hasContent ? (
            <>
              {shouldShowPlaces ? (
                <View className="gap-2.5">
                  {places.map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </View>
              ) : null}
              {shouldShowRoutes ? (
                <View className="gap-2.5">
                  {routes.map((route) => (
                    <RouteCard key={route.id} route={route} />
                  ))}
                </View>
              ) : null}
            </>
          ) : (
            <View className="rounded-2xl border border-border bg-panel-solid p-4">
              <AppText className="text-[13px] font-bold" tone="muted">
                표시할 장소나 경로가 없습니다.
              </AppText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
