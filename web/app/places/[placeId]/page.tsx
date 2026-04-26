"use client";

import { usePlaceDetail } from "@features/places/model/use-place-detail";
import { useParams } from "next/navigation";

import { PlaceDetailContent } from "@/entities/map";
import { ErrorState, LoadingState, PageWrapper } from "@shared/ui";

export default function PlaceDetailPage() {
  const params = useParams<{ placeId: string }>();
  const placeId = params?.placeId ?? "";
  const placeQuery = usePlaceDetail(placeId);
  const place = placeQuery.data?.data;
  if (placeQuery.isLoading) {
    return <LoadingState label="장소 상세를 불러오는 중" />;
  }

  if (placeQuery.isError || !place) {
    return (
      <PageWrapper className="p-6" innerClassName="gap-5">
        <ErrorState
          title="장소 정보를 불러오지 못했습니다"
          message={
            placeQuery.error instanceof Error
              ? placeQuery.error.message
              : undefined
          }
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="p-6 h-full" innerClassName="gap-3 relative">
      <PlaceDetailContent place={place} />
    </PageWrapper>
  );
}
