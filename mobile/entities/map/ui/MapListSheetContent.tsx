import { ActivityIndicator, ScrollView, View } from "react-native";

import { type PlacesQuery, bikerMapTheme } from "@package-shared/index";
import { usePlaceList } from "@/entities/place";
import { RouteCard, useRouteListQuery } from "@/entities/route";
import { PlaceCard } from "@/entities/place/ui/PlaceCard";
import { AppText } from "@/components/common";

type MapListSheetContentProps = {
  activeCategory: PlacesQuery["category"];
};

const SHEET_PAGE_SIZE = 8;

export function MapListSheetContent({
  activeCategory,
}: MapListSheetContentProps) {
  const placesQuery = usePlaceList({
    category: activeCategory,
    limit: SHEET_PAGE_SIZE,
  });
  const routesQuery = useRouteListQuery({
    limit: SHEET_PAGE_SIZE,
  });

  const isInitialLoading = placesQuery.isLoading || routesQuery.isLoading;
  const errorMessage = placesQuery.error?.message ?? routesQuery.error?.message;
  const hasContent =
    !placesQuery.data ||
    !routesQuery.data ||
    placesQuery.data.length < 1 ||
    routesQuery.data.length < 1;

  return (
    <View className="h-full gap-3">
      {isInitialLoading ? (
        <View className="items-center justify-center rounded-2xl border border-border bg-panel-solid py-8">
          <ActivityIndicator color={bikerMapTheme.colors.accent} size="small" />
          <AppText className="mt-3 text-[13px] font-bold" tone="muted">
            지도 목록을 불러오는 중입니다.
          </AppText>
        </View>
      ) : (
        <ScrollView
          className="h-full max-h-185"
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-4 pb-4">
            {errorMessage && (
              <View className="rounded-2xl border border-danger/40 bg-panel-solid p-4">
                <AppText className="text-[13px] font-bold text-danger">
                  {errorMessage}
                </AppText>
              </View>
            )}

            {hasContent ? (
              <>
                <View className="gap-2.5">
                  {placesQuery.data?.map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </View>
                <View className="gap-2.5">
                  {routesQuery.data?.map((route) => (
                    <RouteCard key={route.id} route={route} />
                  ))}
                </View>
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
      )}
    </View>
  );
}
