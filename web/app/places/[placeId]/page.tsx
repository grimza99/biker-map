"use client";

import { usePlaceDetail } from "@features/places/model/use-place-detail";
import { ExternalLink, MapPinned, Phone } from "lucide-react";
import { useParams } from "next/navigation";

import { placeCategoryOptions } from "@/entities/map";
import {
  Button,
  DefaultCardContainer,
  Divider,
  ErrorState,
  LoadingState,
  PageWrapper,
} from "@shared/ui";

export default function PlaceDetailPage() {
  const params = useParams<{ placeId: string }>();
  const placeId = params?.placeId ?? "";
  const placeQuery = usePlaceDetail(placeId);
  const place = placeQuery.data?.data;

  const label = placeCategoryOptions.find(
    (option) => option.value === place?.category
  )?.label;
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
      {place?.images && place.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {place.images.map((image) => (
            <img
              src={image}
              alt={place.name}
              key={image}
              className="h-48 w-full rounded-2xl object-cover"
            />
          ))}
        </div>
      )}
      <div className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">
          {label}
        </span>
        <div className="flex gap-3">
          <h1 className="m-0 text-2xl font-semibold tracking-[-0.04em] text-text">
            {place.name}
          </h1>
          <Divider orientation="vertical" />
          <p className="m-0 text-lg leading-7 text-muted">
            {place.description ??
              "운영자가 큐레이션한 장소입니다. 네이버 플레이스로 바로 이동할 수 있습니다."}
          </p>
        </div>
      </div>
      <Divider />
      <DefaultCardContainer className="grid gap-3 text-sm text-muted">
        <div className="flex items-start gap-3">
          <MapPinned className="mt-1 h-4 w-4 shrink-0 text-accent" />
          <span>{place.address}</span>
        </div>
        <div className="flex items-start gap-3">
          <Phone className="mt-1 h-4 w-4 shrink-0 text-accent" />
          {place.phone ? <span>{place.phone}</span> : <span>정보 없음</span>}
        </div>
      </DefaultCardContainer>

      <Button variant="primary" className="absolute bottom-6 right-6">
        <a
          href={place.naverPlaceUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1"
        >
          <ExternalLink className="h-4 w-4" />
          지도 보기
        </a>
      </Button>
    </PageWrapper>
  );
}
