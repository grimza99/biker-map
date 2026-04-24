import { EmptyState, ErrorState, Input, LoadingState } from "@/shared";
import { PlaceListItem } from "@package-shared/index";
import { Search } from "lucide-react";
import { startTransition, useState } from "react";

import { PlaceCard } from "./PlaceCard";

interface MapSidePanelProps {
  places: PlaceListItem[];
  onChangeSearchInput?: (input: string) => void;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isStale?: boolean;
}
export function MapSidePanel({
  places,
  onChangeSearchInput,
  isLoading,
  isError,
  error,
  isStale = false,
}: MapSidePanelProps) {
  const [searchInput, setSearchInput] = useState("");

  const handleChangeSearchInput = (input: string) => {
    setSearchInput(input);
    onChangeSearchInput?.(input);
  };
  return (
    <aside>
      <Input
        leftIcon={<Search className="h-4.5 w-4.5" />}
        id="map-search"
        name="map-search"
        type="search"
        placeholder="장소, 카테고리, 브랜드, 지역 검색"
        value={searchInput}
        onChange={(event) =>
          startTransition(() => handleChangeSearchInput(event.target.value))
        }
        className="flex-1"
      />
      <div className="mt-2 h-full grid gap-2 rounded-[22px] border border-border bg-panel/82 p-4 shadow-[0_18px_50px_rgba(5,6,7,0.24)] backdrop-blur-xl">
        검색 결과 {places.length}곳
        <div
          className="mt-2 flex h-full max-h-180 flex-col gap-2 overflow-y-scroll pr-1 transition-opacity duration-200"
          style={{ opacity: isStale ? 0.5 : 1 }}
        >
          {isLoading && <LoadingState label="장소를 불러오는 중" />}
          {isError && (
            <ErrorState
              title="장소 목록을 불러오지 못했습니다"
              message={error instanceof Error ? error.message : undefined}
            />
          )}
          {!isLoading && !isError && places.length === 0 && (
            <EmptyState
              title="조건에 맞는 장소가 없습니다"
              className="text-sm"
            />
          )}
          {!isLoading &&
            !isError &&
            places.map((place) => <PlaceCard key={place.id} place={place} />)}
        </div>
      </div>
    </aside>
  );
}
