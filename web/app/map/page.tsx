"use client";

import { usePlaces } from "@features/places/model/use-places";
import { useRouteMapPaths } from "@features/routes/model/use-route-map-paths";
import { RouteCard } from "@/entities";
import type { PlaceListItem, RouteMapPathItem } from "@package-shared/index";
import { ArrowLeftToLine } from "lucide-react";
import { startTransition, useDeferredValue, useMemo, useState } from "react";

import {
  MapSidePanel,
  mapCategoryOptions,
  type MapCategoryFilter,
  NaverDynamicMap,
  PlaceDetailSidePanel,
} from "@/entities/map";
import {
  Button,
  SidePanel,
  SidePanelBody,
  SidePanelContent,
  SidePanelTrigger,
} from "@shared/ui";

export default function MapPage() {
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<MapCategoryFilter | undefined>();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceListItem | null>(
    null
  );
  const [selectedRoute, setSelectedRoute] = useState<RouteMapPathItem | null>(
    null
  );
  const deferredSearch = useDeferredValue(searchInput);
  const isStale = searchInput !== deferredSearch;
  const placeCategory = category === "route" ? undefined : category;
  const filters = useMemo(
    () => ({
      search: deferredSearch,
      category: placeCategory,
      limit: 24,
    }),
    [deferredSearch, placeCategory]
  );
  const { data, isLoading, isError, error } = usePlaces(filters);
  const routeMapPathsQuery = useRouteMapPaths();
  const places = data?.data.items ?? [];
  const routes = routeMapPathsQuery.data?.data.items ?? [];
  const visiblePlaces = category === "route" ? [] : places;
  const visibleRoutes = category === "route" ? routes : [];

  const handleChangeSearchInput = (input: string) => {
    if (category !== "route") {
      setCategory(undefined);
    }
    setSearchInput(input);
  };

  const handleOpenSearchPanel = () => {
    setSelectedPlace(null);
    setSelectedRoute(null);
    setIsSidePanelOpen(true);
  };

  const handleClickPlaceMarker = (place: PlaceListItem) => {
    setSelectedPlace(place);
    setSelectedRoute(null);
    setIsSidePanelOpen(true);
  };

  const handleClickRoutePolyline = (route: RouteMapPathItem) => {
    setSelectedPlace(null);
    setSelectedRoute(route);
    setIsSidePanelOpen(true);
  };

  return (
    <div className="relative min-h-[calc(100vh-11rem)] h-full overflow-hidden ">
      <NaverDynamicMap
        places={visiblePlaces}
        routes={visibleRoutes}
        onClickPlaceMarker={handleClickPlaceMarker}
        onClickRoutePolyline={handleClickRoutePolyline}
      />

      <div className="pointer-events-none absolute inset-0">
        <div className="flex h-full w-full items-start justify-between gap-4 p-5 md:p-6">
          <div className="pointer-events-auto flex flex-wrap gap-2 rounded-2xl border border-border bg-panel/82 p-2 shadow-[0_18px_50px_rgba(5,6,7,0.24)] backdrop-blur-xl">
            {mapCategoryOptions.map((filter) => {
              const active = category === filter.value;

              return (
                <Button
                  key={filter.value}
                  variant="secondary"
                  onClick={() =>
                    startTransition(() =>
                      setCategory((current) =>
                        current === filter.value ? undefined : filter.value
                      )
                    )
                  }
                  selected={active}
                >
                  {filter.label}
                </Button>
              );
            })}
          </div>

          <div className="pointer-events-auto">
            <SidePanel open={isSidePanelOpen} onOpenChange={setIsSidePanelOpen}>
              <SidePanelTrigger asChild>
                <Button variant="primary" onClick={handleOpenSearchPanel}>
                  <ArrowLeftToLine className="m-0 h-4 w-4" />
                </Button>
              </SidePanelTrigger>
              <SidePanelContent
                title={
                  <h2>
                    {selectedPlace
                      ? selectedPlace.name
                      : selectedRoute
                      ? "추천 경로"
                      : "검색"}
                  </h2>
                }
                overlayClassName="bg-transparent backdrop-blur-none"
              >
                <SidePanelBody>
                  {selectedPlace ? (
                    <PlaceDetailSidePanel placeId={selectedPlace.id} />
                  ) : selectedRoute ? (
                    <RouteCard route={selectedRoute} />
                  ) : (
                    <MapSidePanel
                      places={places}
                      onChangeSearchInput={handleChangeSearchInput}
                      isLoading={isLoading}
                      isError={isError}
                      error={error}
                      isStale={isStale}
                    />
                  )}
                </SidePanelBody>
              </SidePanelContent>
            </SidePanel>
          </div>
        </div>
      </div>
    </div>
  );
}
