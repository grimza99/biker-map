"use client";

import { Divide, ExternalLink, Route as RouteIcon, Timer } from "lucide-react";
import { useParams } from "next/navigation";

import { RoutePathMap } from "@/entities/route";
import { useRouteDetail } from "@/features/routes/model/use-route-detail";
import {
  Chip,
  DefaultCardContainer,
  ErrorState,
  LoadingState,
  MarkdownContent,
  PageWrapper,
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

export default function RouteDetailPage() {
  const params = useParams<{ routeId: string }>();
  const routeId = params?.routeId ?? "";
  const routeQuery = useRouteDetail(routeId);
  const route = routeQuery.data?.data;
  if (routeQuery.isLoading) {
    return <LoadingState label="경로를 불러오는 중" />;
  }

  if (routeQuery.isError || !route) {
    return (
      <PageWrapper className="p-6" innerClassName="gap-5">
        <ErrorState
          title="경로 정보를 불러오지 못했습니다"
          message={
            routeQuery.error instanceof Error
              ? routeQuery.error.message
              : undefined
          }
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="p-6" innerClassName="gap-5">
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Chip label={sourceTypeLabel[route.sourceType]} />
          <Chip
            label={
              providerLabel[route.provider as keyof typeof providerLabel] ??
              "알 수 없음"
            }
          />
        </div>
        <h1 className="m-0 text-[clamp(28px,4vw,42px)] font-semibold tracking-[-0.04em] text-text">
          {route.title}
        </h1>
      </div>
      <Divide className="my-5 h-px w-full border-0 bg-border" />
      <div className="grid gap-5 md:grid-cols-2">
        <DefaultCardContainer>
          <h2 className="m-0 text-lg font-semibold text-text">경로 정보</h2>
          <div className="grid gap-3 text-sm text-muted">
            {route.distanceKm && (
              <div className="flex items-center gap-3">
                <RouteIcon className="h-4 w-4 text-accent" />
                예상 거리: {route.distanceKm}km
              </div>
            )}
            {route.estimatedDurationMinutes && (
              <div className="flex items-center gap-3">
                <Timer className="h-4 w-4 text-accent" />
                예상 소요: {route.estimatedDurationMinutes}분
              </div>
            )}
            {route.tags.length ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {route.tags.map((tag) => (
                  <TagChip key={tag} label={tag} />
                ))}
              </div>
            ) : null}
          </div>
        </DefaultCardContainer>
        <DefaultCardContainer>
          <h2 className="m-0 text-lg font-semibold text-text">
            길안내 외부 지도 앱으로 이동
          </h2>
          <a
            href={route.externalMapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-2.5 text-sm font-medium text-text transition hover:-translate-y-0.5"
          >
            <ExternalLink className="h-4 w-4" />
            외부 앱으로 경로 보기
          </a>
        </DefaultCardContainer>
      </div>
      {route.path.length ? (
        <RoutePathMap path={route.path} />
      ) : null}
      <MarkdownContent content={route.content} />
    </PageWrapper>
  );
}
