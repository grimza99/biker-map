"use client";

import { usePlaces } from "@features/places/model/use-places";
import { useRouteMapPaths } from "@features/routes/model/use-route-map-paths";
import type { PlaceCategory } from "@package-shared/types/place";
import { ArrowLeftToLine } from "lucide-react";
import { startTransition, useDeferredValue, useMemo, useState } from "react";

import {
  MapSidePanel,
  NaverDynamicMap,
  placeCategoryOptions,
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
  const [category, setCategory] = useState<PlaceCategory | undefined>();
  const deferredSearch = useDeferredValue(searchInput);
  const isStale = searchInput !== deferredSearch;
  const filters = useMemo(
    () => ({
      search: deferredSearch,
      category,
      limit: 24,
    }),
    [category, deferredSearch]
  );
  const { data, isLoading, isError, error } = usePlaces(filters);
  const routeMapPathsQuery = useRouteMapPaths();
  const places = data?.data.items ?? [];
  const routes = routeMapPathsQuery.data?.data.items ?? [];

  const handleChangeSearchInput = (input: string) => {
    setCategory(undefined);
    setSearchInput(input);
  };

  return (
    <div className="relative min-h-[calc(100vh-11rem)] h-full overflow-hidden ">
      <NaverDynamicMap places={places} routes={routes} />

      <div className="pointer-events-none absolute inset-0">
        <div className="flex w-full h-full items-start justify-between gap-4 p-5 md:p-6">
          <div className="pointer-events-auto rounded-2xl flex flex-wrap gap-2 border border-border bg-panel/82 p-2 shadow-[0_18px_50px_rgba(5,6,7,0.24)] backdrop-blur-xl">
            {placeCategoryOptions.map((filter) => {
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
            <SidePanel>
            <SidePanelTrigger asChild>
              <Button variant="primary">
                <ArrowLeftToLine className="w-4 h-4 m-0" />
              </Button>
            </SidePanelTrigger>
            <SidePanelContent
              title={<h2>검색</h2>}
              overlayClassName="bg-transparent backdrop-blur-none"
            >
              <SidePanelBody>
                <MapSidePanel
                  places={places}
                  onChangeSearchInput={handleChangeSearchInput}
                  isLoading={isLoading}
                  isError={isError}
                  error={error}
                  isStale={isStale}
                />
              </SidePanelBody>
            </SidePanelContent>
            </SidePanel>
          </div>
        </div>
      </div>
    </div>
  );
}
