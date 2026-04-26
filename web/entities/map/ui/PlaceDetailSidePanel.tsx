import { usePlaceDetail } from "@features/places/model/use-place-detail";

import { ErrorState, LoadingState } from "@shared/ui";

import { PlaceDetailContent } from "./PlaceDetailContent";

export function PlaceDetailSidePanel({ placeId }: { placeId: string }) {
  const placeQuery = usePlaceDetail(placeId);
  const place = placeQuery.data?.data;

  if (placeQuery.isLoading) {
    return <LoadingState label="장소 상세를 불러오는 중" />;
  }

  if (placeQuery.isError || !place) {
    return (
      <ErrorState
        title="장소 정보를 불러오지 못했습니다"
        message={
          placeQuery.error instanceof Error ? placeQuery.error.message : undefined
        }
      />
    );
  }

  return <PlaceDetailContent place={place} />;
}
