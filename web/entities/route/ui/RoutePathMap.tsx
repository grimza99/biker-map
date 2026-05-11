"use client";

import type { RoutePathPoint } from "@package-shared/types/route";
import { useMemo, useState } from "react";

import { ErrorState } from "@shared/ui";

function isValidCoordinate(coordinate?: Partial<RoutePathPoint>) {
  return Number.isFinite(coordinate?.lat) && Number.isFinite(coordinate?.lng);
}

type RoutePathMapProps = {
  routeId: string;
  path: RoutePathPoint[];
};

export function RoutePathMap({ routeId, path }: RoutePathMapProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const validPath = useMemo(
    () => path.filter((point) => isValidCoordinate(point)),
    [path]
  );

  const imageUrl = useMemo(
    () => (validPath.length ? `/api/routes/${routeId}/static-map` : null),
    [routeId, validPath.length]
  );

  if (!imageUrl) {
    return (
      <div className="relative h-90 overflow-hidden rounded-4xl border border-border bg-panel-soft">
        <div className="absolute inset-0 grid place-items-center p-4">
          <ErrorState
            title="경로 지도를 불러오지 못했습니다"
            message="표시할 경로 좌표가 없습니다."
          />
        </div>
      </div>
    );
  }

  if (hasImageError) {
    return (
      <div className="relative h-90 overflow-hidden rounded-4xl border border-border bg-panel-soft">
        <div className="absolute inset-0 grid place-items-center p-4">
          <ErrorState
            title="경로 지도를 불러오지 못했습니다"
            message="정적 지도를 생성하지 못했습니다. 서버 인증 설정을 확인해주세요."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-90 overflow-hidden rounded-4xl border border-border bg-panel-soft">
      <img
        src={imageUrl}
        alt="경로 static map"
        className="h-full w-full object-cover"
        onError={() => setHasImageError(true)}
      />
      <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-background/80 px-3 py-1.5 text-xs font-medium text-text backdrop-blur">
        출발지 / 도착지 기준 static map
      </div>
    </div>
  );
}
