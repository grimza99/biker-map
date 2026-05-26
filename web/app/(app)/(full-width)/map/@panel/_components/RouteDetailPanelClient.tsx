"use client";

import { ExternalLink, MapPinned, Route as RouteIcon, Timer } from "lucide-react";
import Link from "next/link";
import { regionLabel } from "@package-shared/index";

import { FavoriteHeartButton } from "@/features/favorites/ui/FavoriteHeartButton";
import { useRouteDetail } from "@/features/routes/model/use-route-detail";
import {
  Chip,
  DefaultCardContainer,
  ErrorState,
  LoadingState,
  MarkdownContent,
  TagChip,
} from "@shared/ui";

const providerLabel = {
  naver: "네이버 지도",
  etc: "외부 지도",
} as const;

const sourceTypeLabel = {
  curated: "큐레이션",
  user: "사용자 생성",
} as const;

export function RouteDetailPanelClient({ routeId }: { routeId: string }) {
  const { data, isLoading, isError, error } = useRouteDetail(routeId);
  const route = data?.data;

  if (isLoading) {
    return <LoadingState label="경로를 불러오는 중" />;
  }

  if (isError || !route) {
    return (
      <ErrorState
        title="경로 정보를 불러오지 못했습니다"
        message={error instanceof Error ? error.message : undefined}
      />
    );
  }

  return (
    <div className="grid gap-5">
      {route.thumbnailUrl ? (
        <img
          src={route.thumbnailUrl}
          alt={route.title}
          className="h-44 w-full rounded-2xl border border-border object-cover"
        />
      ) : null}

      <div className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Chip label={sourceTypeLabel[route.sourceType]} />
            <Chip
              label={
                providerLabel[route.provider as keyof typeof providerLabel] ??
                "알 수 없음"
              }
            />
          </div>
          <FavoriteHeartButton
            targetType="route"
            targetId={route.id}
            favorited={route.favorited}
            favoriteId={route.favoriteId}
          />
        </div>
        <h1 className="m-0 text-2xl font-semibold text-text">{route.title}</h1>
        <p className="m-0 text-sm leading-6 text-muted">{route.summary}</p>
      </div>

      <DefaultCardContainer className="rounded-2xl p-4">
        <h3 className="m-0 text-base font-semibold text-text">경로 정보</h3>
        <div className="grid gap-3 text-sm text-muted">
          {route.departureRegion ? (
            <div className="flex items-center gap-3">
              <MapPinned className="h-4 w-4 text-accent" />
              출발: {regionLabel[route.departureRegion]}
            </div>
          ) : null}
          {route.destinationRegion ? (
            <div className="flex items-center gap-3">
              <MapPinned className="h-4 w-4 text-accent" />
              도착: {regionLabel[route.destinationRegion]}
            </div>
          ) : null}
          {route.distanceKm ? (
            <div className="flex items-center gap-3">
              <RouteIcon className="h-4 w-4 text-accent" />
              예상 거리: {route.distanceKm}km
            </div>
          ) : null}
          {route.estimatedDurationMinutes ? (
            <div className="flex items-center gap-3">
              <Timer className="h-4 w-4 text-accent" />
              예상 소요: {route.estimatedDurationMinutes}분
            </div>
          ) : null}
          {route.tags.length ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {route.tags.map((tag) => (
                <TagChip key={tag} label={tag} />
              ))}
            </div>
          ) : null}
        </div>
      </DefaultCardContainer>

      <div className="grid gap-2 sm:grid-cols-2">
        <Link
          href={`/routes/${route.id}`}
          className="inline-flex h-11 w-full items-center justify-center rounded-full border border-border bg-panel-solid px-4.5 text-sm font-medium text-text transition duration-150 ease-out hover:border-accent hover:bg-panel-soft"
        >
          상세 보기
        </Link>
        <a
          href={route.externalMapUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-accent bg-accent px-4.5 text-sm font-medium text-text shadow-[var(--shadow-accent)] transition duration-150 ease-out hover:border-accent-light hover:bg-accent-light"
        >
          <ExternalLink className="h-4 w-4" />
          경로 보기
        </a>
      </div>

      <MarkdownContent content={route.content} className="text-sm" />
    </div>
  );
}
