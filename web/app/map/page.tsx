"use client";

import { usePlaces } from "@features/places/model/use-places";
import type { PlaceCategory } from "@package-shared/types/place";
import { ArrowLeftToLine } from "lucide-react";
import { startTransition, useDeferredValue, useMemo, useState } from "react";

import { MapSidePanel, placeCategoryOptions } from "@/entities/map";
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
  const filters = useMemo(
    () => ({
      search: deferredSearch,
      category,
      limit: 24,
    }),
    [category, deferredSearch]
  );
  const { data, isLoading, isError, error } = usePlaces(filters);
  const places = data?.data.items ?? [];

  const handleChangeSearchInput = (input: string) => {
    setCategory(undefined);
    setSearchInput(input);
  };

  return (
    <div className="relative min-h-[calc(100vh-11rem)] h-full overflow-hidden ">
      {/* 백그라운드 이미지- 추후 지도 ui로 대체  */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(229, 87, 47, 0.18), transparent 26%), radial-gradient(circle at 82% 18%, rgba(0, 194, 168, 0.14), transparent 24%), radial-gradient(circle at 50% 88%, rgba(77, 163, 255, 0.10), transparent 28%), linear-gradient(180deg, rgba(23, 26, 30, 0.96) 0%, rgba(29, 34, 40, 0.98) 46%, rgba(17, 19, 21, 0.99) 100%)",
        }}
      />
      {/* 백그라운드 이미지- 추후 지도 ui로 대체  */}

      <div className="absolute inset-0">
        <div className="flex w-full h-full items-start justify-between gap-4 p-5 md:p-6">
          <div className="rounded-2xl flex flex-wrap gap-2 border border-border bg-panel/82 p-2 shadow-[0_18px_50px_rgba(5,6,7,0.24)] backdrop-blur-xl">
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
                />
              </SidePanelBody>
            </SidePanelContent>
          </SidePanel>
        </div>
      </div>
    </div>
  );
}
