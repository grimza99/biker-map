"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { MapSidePanel } from "@/entities/map";
import { usePlaces } from "@features/places/model/use-places";
import { useRoutes } from "@/features/routes/model/use-routes";
import { RouteCard } from "@/entities/route";
import { EmptyState, ErrorState, Input, LoadingState } from "@/shared";
import { Search } from "lucide-react";

import { useMapCanvasData } from "../../_components/MapCanvasDataProvider";

export function MapListPanelClient() {
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const { placesQuery: mapPlacesQuery } = useMapCanvasData();
  const panelCategory = searchParams.get("category");
  const isRoutePanel = panelCategory === "route";
  const trimmedSearch = search.trim();
  const filters = useMemo(
    () => ({
      search: trimmedSearch,
      limit: 100,
    }),
    [trimmedSearch]
  );
  const searchPlacesQuery = usePlaces(filters, {
    enabled: trimmedSearch.length > 0,
  });
  const routesQuery = useRoutes(filters, {
    enabled: isRoutePanel,
  });
  const activePlacesQuery =
    trimmedSearch.length > 0 ? searchPlacesQuery : mapPlacesQuery;

  if (isRoutePanel) {
    const { data, isLoading, isError, error, isPlaceholderData } = routesQuery;
    const routes = data?.data.items ?? [];

    return (
      <aside>
        <Input
          leftIcon={<Search className="h-4.5 w-4.5" />}
          id="map-search"
          name="map-search"
          type="search"
          placeholder="경로 제목, 지역, 태그 검색"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="flex-1"
        />
        <div className="mt-2 grid h-full gap-2 rounded-[22px] border border-border bg-panel/82 p-4 shadow-[0_18px_50px_rgba(5,6,7,0.24)] backdrop-blur-xl">
          검색 결과 {routes.length}개 경로
          <div
            className="mt-2 flex h-full max-h-180 flex-col gap-2 overflow-y-scroll pr-1 transition-opacity duration-200"
            style={{ opacity: isPlaceholderData ? 0.5 : 1 }}
          >
            {isLoading && <LoadingState label="경로를 불러오는 중" />}
            {isError && (
              <ErrorState
                title="경로 목록을 불러오지 못했습니다"
                message={error instanceof Error ? error.message : undefined}
              />
            )}
            {!isLoading && !isError && routes.length === 0 && (
              <EmptyState
                title="조건에 맞는 경로가 없습니다"
                className="text-sm"
              />
            )}
            {!isLoading &&
              !isError &&
              routes.map((route) => <RouteCard key={route.id} route={route} />)}
          </div>
        </div>
      </aside>
    );
  }

  const { data, isLoading, isError, error, isPlaceholderData } =
    activePlacesQuery;
  const places = data?.data.items ?? [];

  return (
    <MapSidePanel
      places={places}
      onChangeSearchInput={setSearch}
      isLoading={isLoading}
      isError={isError}
      error={error}
      isStale={isPlaceholderData}
    />
  );
}
