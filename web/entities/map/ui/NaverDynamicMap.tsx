"use client";

import { ErrorState } from "@/shared";
import type { PlaceListItem } from "@package-shared/types/place";
import type { RouteMapPathItem } from "@package-shared/types/route";
import { useEffect, useMemo, useRef, useState } from "react";

import { PlaceMarker } from "../model/PlaceMarker";
import { RoutePolyline } from "../model/RoutePolyline";

declare global {
  interface Window {
    naver?: any;
  }
}

const NAVER_MAP_SCRIPT_ID = "naver-map-sdk";
const SOUTH_KOREA_BOUNDS = {
  southWest: { lat: 34.0, lng: 125.5 },
  northEast: { lat: 37.75, lng: 130.9 },
};
const ROUTE_POLYLINE_MIN_ZOOM = 10;

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

type NaverDynamicMapProps = {
  places: PlaceListItem[];
  routes?: RouteMapPathItem[];
  onClickPlaceMarker?: (place: PlaceListItem) => void;
  onClickRoutePolyline?: (route: RouteMapPathItem) => void;
};

export function NaverDynamicMap({
  places,
  routes = [],
  onClickPlaceMarker,
  onClickRoutePolyline,
}: NaverDynamicMapProps) {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const mapsApiRef = useRef<any>(null);
  const markersRef = useRef<PlaceMarker[]>([]);
  const routePolylinesRef = useRef<RoutePolyline[]>([]);
  const routePolylineVisibleRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const validPlaces = useMemo(
    () =>
      places.filter(
        (place) => Number.isFinite(place.lat) && Number.isFinite(place.lng)
      ),
    [places]
  );

  const validRoutes = useMemo(
    () =>
      routes.filter(
        (route) =>
          route.path.filter(
            (point) => Number.isFinite(point.lat) && Number.isFinite(point.lng)
          ).length >= 2
      ),
    [routes]
  );

  function syncRouteVisibility() {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const shouldShow = map.getZoom() >= ROUTE_POLYLINE_MIN_ZOOM;
    if (routePolylineVisibleRef.current === shouldShow) {
      return;
    }

    routePolylineVisibleRef.current = shouldShow;
    routePolylinesRef.current.forEach((routePolyline) => {
      if (shouldShow) {
        routePolyline.attach();
        return;
      }

      routePolyline.detach();
    });
  }

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
          const defaultBounds = new maps.LatLngBounds(
            new maps.LatLng(
              SOUTH_KOREA_BOUNDS.southWest.lat,
              SOUTH_KOREA_BOUNDS.southWest.lng
            ),
            new maps.LatLng(
              SOUTH_KOREA_BOUNDS.northEast.lat,
              SOUTH_KOREA_BOUNDS.northEast.lng
            )
          );

          mapRef.current = new maps.Map(mapElementRef.current, {
            center: new maps.LatLng(36.4, 127.8),
            zoom: 7,
            minZoom: 6,
            maxZoom: 16,
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
            maxBounds: defaultBounds,
          });

          mapRef.current.fitBounds(defaultBounds);
          maps.Event.addListener(mapRef.current, "zoom_changed", () => {
            syncRouteVisibility();
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

    markersRef.current.forEach((marker) => marker.detach());
    markersRef.current = validPlaces.map(
      (place) => new PlaceMarker(maps, map, place, onClickPlaceMarker)
    );
  }, [onClickPlaceMarker, validPlaces]);

  useEffect(() => {
    const map = mapRef.current;
    const maps = mapsApiRef.current;

    if (!map || !maps) {
      return;
    }

    routePolylinesRef.current.forEach((routePolyline) =>
      routePolyline.detach()
    );
    routePolylinesRef.current = validRoutes.map(
      (route) => new RoutePolyline(maps, map, route, onClickRoutePolyline)
    );
    routePolylineVisibleRef.current = false;
    syncRouteVisibility();
  }, [onClickRoutePolyline, validRoutes]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-panel-soft">
      <div ref={mapElementRef} className="h-full w-full" />

      {!isLoaded && !error ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(229,87,47,0.18),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(0,194,168,0.14),transparent_24%),radial-gradient(circle_at_50%_88%,rgba(77,163,255,0.10),transparent_28%),linear-gradient(180deg,rgba(23,26,30,0.96)_0%,rgba(29,34,40,0.98)_46%,rgba(17,19,21,0.99)_100%)]" />
      ) : null}

      {error && <ErrorState title="지도를 불러오지 못했습니다" />}
    </div>
  );
}
