"use client";

import {
  distanceOptions,
  routeRegionOptions,
  type RouteRegion,
} from "@package-shared/index";
import {
  DefaultCardContainer,
  EmptyState,
  ErrorState,
  LoadingState,
  PageWrapper,
  SelectInput,
} from "@shared/ui";

import { useMemo, useState } from "react";

import { RouteCard } from "@/entities";
import { useRoutes } from "@features/routes/model/use-routes";

export default function RouteListPage() {
  const [departureRegion, setDepartureRegion] = useState<RouteRegion>("all");
  const [destinationRegion, setDestinationRegion] =
    useState<RouteRegion>("all");
  const [maxDistanceKm, setMaxDistanceKm] = useState<string>("all");

  const filters = useMemo(
    () => ({
      departureRegion: departureRegion || undefined,
      destinationRegion: destinationRegion || undefined,
      maxDistanceKm: maxDistanceKm ? Number(maxDistanceKm) : undefined,
      limit: 24,
    }),
    [departureRegion, destinationRegion, maxDistanceKm]
  );

  const routesQuery = useRoutes(filters);
  const routes = routesQuery.data?.data.items ?? [];

  return (
    <PageWrapper className="p-6" innerClassName="gap-5">
      <DefaultCardContainer className="gap-3 border-accent/20 bg-[linear-gradient(135deg,rgba(229,87,47,0.16),rgba(23,26,30,0.9))]">
        <p className="m-0 text-[12px] font-semibold uppercase tracking-widest text-accent">
          Curated Drive Routes
        </p>
        <h1 className="m-0 text-[clamp(26px,4vw,40px)] font-semibold tracking-[-0.04em] text-text">
          바이커맵에서 큐레이션해 드리는 라이딩 경로
        </h1>
        <p className="m-0 text-sm leading-7 text-muted">
          바이커맵 운영자가 직접 정리한 라이딩 경로를 출발지, 도착지, 거리
          기준으로 골라볼 수 있어요.
        </p>
      </DefaultCardContainer>

      <div className="grid gap-4 md:grid-cols-3">
        <SelectInput
          label="출발지"
          placeholder="전체"
          value={departureRegion}
          onValueChange={(nextValue) =>
            setDepartureRegion(nextValue as RouteRegion)
          }
          options={routeRegionOptions}
        />
        <SelectInput
          label="도착지"
          placeholder="전체"
          value={destinationRegion}
          onValueChange={(nextValue) =>
            setDestinationRegion(nextValue as RouteRegion)
          }
          options={routeRegionOptions}
        />
        <SelectInput
          label="거리"
          placeholder="전체"
          value={maxDistanceKm}
          onValueChange={setMaxDistanceKm}
          options={distanceOptions}
        />
      </div>

      {routesQuery.isLoading && (
        <LoadingState label="라이딩 경로를 불러오는 중" />
      )}

      {routesQuery.isError && (
        <ErrorState
          title="라이딩 경로를 불러오지 못했습니다"
          message='잠시 후 다시 시도해 주세요. 문제가 계속된다면 "문의하기"로 알려주세요.'
        />
      )}

      {!routesQuery.isLoading &&
        !routesQuery.isError &&
        routes.length === 0 && (
          <EmptyState title="조건에 맞는 라이딩 경로가 아직 없습니다" />
        )}

      {!routesQuery.isLoading && !routesQuery.isError && routes.length ? (
        <div className="flex flex-col gap-4">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      ) : null}
    </PageWrapper>
  );
}
