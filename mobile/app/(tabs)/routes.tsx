import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import {
  bikerMapTheme,
  distanceOptions,
  routeRegionOptions,
  type RouteRegion,
  type RoutesQuery,
} from "@package-shared/index";

import {
  AppText,
  Button,
  Chip,
  DropdownMenu,
  Input,
  Pagination,
} from "@/components/common";
import { RouteCard, useRouteListResponseQuery } from "@/entities/route";
import { AppScreen } from "../../components/shell";

const ROUTE_PAGE_SIZE = 5;
const REGION_OPTIONS = routeRegionOptions.map((option) => ({
  label: option.label,
  value: option.value,
}));
const DISTANCE_OPTIONS = distanceOptions
  .filter((option) => option.value !== "over200")
  .map((option) => ({
    label: option.label,
    value: option.value,
  }));
const FILTER_TRIGGER_STYLE = {
  triggerPressable: undefined,
  triggerText: "text-[13px]",
};

type DistanceFilter = (typeof DISTANCE_OPTIONS)[number]["value"];

export default function RoutesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departureRegion, setDepartureRegion] = useState<RouteRegion>("all");
  const [destinationRegion, setDestinationRegion] =
    useState<RouteRegion>("all");
  const [maxDistanceKm, setMaxDistanceKm] = useState<DistanceFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const query = useMemo<RoutesQuery>(
    () => ({
      departureRegion,
      destinationRegion,
      limit: currentPage * ROUTE_PAGE_SIZE,
      maxDistanceKm:
        maxDistanceKm === "all" ? undefined : Number(maxDistanceKm),
      search: searchQuery,
    }),
    [
      currentPage,
      departureRegion,
      destinationRegion,
      maxDistanceKm,
      searchQuery,
    ]
  );
  const routesQuery = useRouteListResponseQuery(query);
  const allLoadedRoutes = routesQuery.data?.data.items ?? [];
  const totalRouteCount =
    routesQuery.data?.meta?.total ?? allLoadedRoutes.length;
  const totalPages = Math.max(1, Math.ceil(totalRouteCount / ROUTE_PAGE_SIZE));
  const pageStartIndex = (currentPage - 1) * ROUTE_PAGE_SIZE;
  const visibleRoutes = allLoadedRoutes.slice(
    pageStartIndex,
    currentPage * ROUTE_PAGE_SIZE
  );
  const isFetchingNextPage = routesQuery.isFetching && !routesQuery.isLoading;
  const isWaitingForPage =
    isFetchingNextPage && allLoadedRoutes.length <= pageStartIndex;
  const selectedDepartureLabel = getRegionLabel(departureRegion);
  const selectedDestinationLabel = getRegionLabel(destinationRegion);
  const selectedDistanceLabel =
    DISTANCE_OPTIONS.find((option) => option.value === maxDistanceKm)?.label ??
    "";

  function resetToFirstPage() {
    setCurrentPage(1);
  }

  return (
    <AppScreen>
      {/* hero */}
      <View className="gap-3 rounded-[28px] border border-accent/20 bg-panel p-5">
        <View className="gap-2">
          <AppText className="text-[28px] font-extrabold leading-8">
            바이커맵 추천 라이딩 경로
          </AppText>
          <AppText className="text-[14px] leading-5.25" tone="muted">
            운영자가 직접 큐레이션한 라이딩 코스를 즐겨보세요
          </AppText>
        </View>
      </View>

      {/* search, filter */}
      <View className="gap-3 rounded-3xl border border-border bg-panel-solid p-4">
        <Input
          value={searchQuery}
          onChangeText={(value) => {
            setSearchQuery(value);
            resetToFirstPage();
          }}
          placeholder="큐레이션 경로 검색"
          leftIcon={
            <Feather
              name="search"
              size={18}
              color={bikerMapTheme.colors.muted}
            />
          }
        />

        <View className="gap-2.5">
          <View className="flex-row gap-2.5">
            <View className="flex-1">
              <DropdownMenu
                label="출발지"
                options={REGION_OPTIONS}
                triggerStyle={FILTER_TRIGGER_STYLE}
                value={departureRegion}
                onValueChange={(value) => {
                  setDepartureRegion(value as RouteRegion);
                  resetToFirstPage();
                }}
              />
            </View>
            <View className="flex-1">
              <DropdownMenu
                label="도착지"
                options={REGION_OPTIONS}
                triggerStyle={FILTER_TRIGGER_STYLE}
                value={destinationRegion}
                onValueChange={(value) => {
                  setDestinationRegion(value as RouteRegion);
                  resetToFirstPage();
                }}
              />
            </View>
          </View>

          <DropdownMenu
            label="거리"
            options={DISTANCE_OPTIONS}
            triggerStyle={FILTER_TRIGGER_STYLE}
            value={maxDistanceKm}
            onValueChange={(value) => {
              setMaxDistanceKm(value as DistanceFilter);
              resetToFirstPage();
            }}
          />
        </View>
      </View>

      {/* route list loading, error, empty return */}
      {routesQuery.isLoading || isWaitingForPage ? (
        <View className="items-center justify-center rounded-3xl border border-border bg-panel-solid py-10">
          <ActivityIndicator color={bikerMapTheme.colors.accent} size="small" />
          <AppText className="mt-3 text-sm font-bold" tone="muted">
            라이딩 경로를 불러오는 중입니다.
          </AppText>
        </View>
      ) : null}

      {routesQuery.isError ? (
        <View className="gap-2 rounded-3xl border border-danger/40 bg-panel-solid p-4">
          <AppText className="text-base font-extrabold" tone="danger">
            라이딩 경로를 불러오지 못했습니다.
          </AppText>
          <AppText className="text-sm leading-5" tone="muted">
            {routesQuery.error.message}
          </AppText>
          <Button
            variant="secondary"
            onPress={() => {
              void routesQuery.refetch();
            }}
          >
            다시 시도
          </Button>
        </View>
      ) : null}

      {!routesQuery.isLoading &&
      !isWaitingForPage &&
      !routesQuery.isError &&
      visibleRoutes.length === 0 ? (
        <View className="items-center gap-2 rounded-3xl border border-border bg-panel-solid px-4 py-8">
          <AppText className="text-base font-extrabold">
            조건에 맞는 경로가 없습니다.
          </AppText>
          <AppText className="text-center text-sm leading-5" tone="muted">
            검색어나 필터를 조정해 다시 확인해보세요.
          </AppText>
        </View>
      ) : null}

      {/* applied filter */}
      {!routesQuery.isLoading &&
      !isWaitingForPage &&
      !routesQuery.isError &&
      visibleRoutes.length > 0 ? (
        <View className="gap-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 pb-0.5"
          >
            {departureRegion !== "all" ? (
              <Chip label={`출발 ${selectedDepartureLabel}`} />
            ) : null}
            {destinationRegion !== "all" ? (
              <Chip label={`도착 ${selectedDestinationLabel}`} />
            ) : null}
            {maxDistanceKm !== "all" ? (
              <Chip label={selectedDistanceLabel} />
            ) : null}
          </ScrollView>

          {/* route liset */}
          <View className="gap-3">
            {visibleRoutes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </View>
          {/* pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </View>
      ) : null}
    </AppScreen>
  );
}

function getRegionLabel(region: RouteRegion) {
  return (
    routeRegionOptions.find((option) => option.value === region)?.label ?? ""
  );
}
