"use client";

import type { RoutePathPoint } from "@package-shared/types/route";
import { useEffect, useMemo, useRef, useState } from "react";

import { ErrorState } from "@shared/ui";

declare global {
  interface Window {
    naver?: any;
  }
}

const NAVER_MAP_SCRIPT_ID = "naver-map-sdk";

function buildNaverMapScriptUrl(clientId: string) {
  return `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
}

function loadNaverMaps(clientId: string) {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("브라우저 환경에서만 지도를 로드할 수 있습니다.")
    );
  }

  if (window.naver?.maps) {
    return Promise.resolve(window.naver.maps);
  }

  return new Promise<any>((resolve, reject) => {
    const existingScript = document.getElementById(
      NAVER_MAP_SCRIPT_ID
    ) as HTMLScriptElement | null;

    const handleLoad = () => {
      if (window.naver?.maps) {
        resolve(window.naver.maps);
        return;
      }

      reject(new Error("네이버 지도 SDK를 불러오지 못했습니다."));
    };

    const handleError = () => {
      reject(new Error("네이버 지도 스크립트 로드에 실패했습니다."));
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = NAVER_MAP_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = buildNaverMapScriptUrl(clientId);
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);
  });
}

function isValidCoordinate(coordinate?: Partial<RoutePathPoint>) {
  return Number.isFinite(coordinate?.lat) && Number.isFinite(coordinate?.lng);
}

type RoutePathMapProps = {
  path: RoutePathPoint[];
};

export function RoutePathMap({ path }: RoutePathMapProps) {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const mapsApiRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const validPath = useMemo(
    () => path.filter((point) => isValidCoordinate(point)),
    [path]
  );

  useEffect(() => {
    if (!clientId) {
      setError(
        "NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 환경변수가 없어 지도를 표시할 수 없습니다."
      );
      return;
    }

    let canceled = false;

    void loadNaverMaps(clientId)
      .then((maps) => {
        if (canceled || !mapElementRef.current) {
          return;
        }

        mapsApiRef.current = maps;

        if (!mapRef.current) {
          mapRef.current = new maps.Map(mapElementRef.current, {
            center: new maps.LatLng(36.4, 127.8),
            zoom: 8,
            minZoom: 6,
            maxZoom: 17,
            pinchZoom: true,
            scrollWheel: true,
            keyboardShortcuts: true,
            scaleControl: false,
            logoControl: false,
            mapDataControl: false,
            zoomControl: true,
            zoomControlOptions: {
              position: maps.Position.TOP_RIGHT,
            },
          });
        }

        setError(null);
        setIsLoaded(true);
      })
      .catch((sdkError) => {
        if (!canceled) {
          setError(
            sdkError instanceof Error
              ? sdkError.message
              : "네이버 지도를 불러오지 못했습니다."
          );
        }
      });

    return () => {
      canceled = true;
    };
  }, [clientId]);

  useEffect(() => {
    const map = mapRef.current;
    const maps = mapsApiRef.current;

    if (!map || !maps) {
      return;
    }

    polylineRef.current?.setMap(null);

    if (!validPath.length) {
      return;
    }

    const naverPath = validPath.map(
      (point) => new maps.LatLng(point.lat, point.lng)
    );

    polylineRef.current = new maps.Polyline({
      map,
      path: naverPath,
      strokeColor: "#E5572F",
      strokeOpacity: 0.95,
      strokeWeight: 6,
      strokeLineCap: "round",
      strokeLineJoin: "round",
    });

    const bounds = naverPath.reduce((nextBounds, latLng) => {
      nextBounds.extend(latLng);
      return nextBounds;
    }, new maps.LatLngBounds(naverPath[0], naverPath[0]));

    map.fitBounds(bounds);
  }, [isLoaded, validPath]);

  return (
    <div className="relative h-[360px] overflow-hidden rounded-[32px] border border-border bg-panel-soft">
      <div ref={mapElementRef} className="h-full w-full" />
      {!isLoaded && !error ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(229,87,47,0.18),transparent_26%),linear-gradient(180deg,rgba(23,26,30,0.96)_0%,rgba(17,19,21,0.99)_100%)]" />
      ) : null}
      {error ? (
        <div className="absolute inset-0 grid place-items-center p-4">
          <ErrorState title="경로 지도를 불러오지 못했습니다" message={error} />
        </div>
      ) : null}
    </div>
  );
}
