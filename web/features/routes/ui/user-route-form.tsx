"use client";

import {
  API_PATHS,
  type CreateRouteBody,
  type PlaceGeocodeResponseData,
  type RouteDetail,
  type UpdateRouteBody,
} from "@package-shared/index";
import { addressRegionMap } from "@package-shared/model/route";
import { useEffect, useState } from "react";

import { useDebouncedValue } from "@/shared";
import { apiFetch } from "@shared/api/http";
import { Button, Input, Textarea, Toast } from "@shared/ui";

import { useCreateRouteMutate, useEditRouteMutate } from "../model/use-route";

type WaypointDraft = {
  id: string;
  address: string;
  lat: string;
  lng: string;
};

function createWaypointDraft(lat = "", lng = "", address = ""): WaypointDraft {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    address,
    lat,
    lng,
  };
}

function parseCoordinateValue(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapAddressToRouteRegion(address: string) {
  const normalizedAddress = address.trim();
  return addressRegionMap.find(({ prefix }) =>
    normalizedAddress.startsWith(prefix)
  )?.region;
}

function buildSummaryFromMemo(memo: string, title: string) {
  const trimmedMemo = memo.trim();
  if (trimmedMemo) {
    return trimmedMemo.slice(0, 120);
  }

  return `${title.trim()} 경로`;
}

export function UserRouteForm({
  initialData,
  onSuccess,
  onCancel,
  submitLabel,
}: {
  initialData?: RouteDetail | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [departureAddress, setDepartureAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [departureLat, setDepartureLat] = useState("");
  const [departureLng, setDepartureLng] = useState("");
  const [destinationLat, setDestinationLat] = useState("");
  const [destinationLng, setDestinationLng] = useState("");
  const [waypoints, setWaypoints] = useState<WaypointDraft[]>([]);
  const [geocodingKey, setGeocodingKey] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const debouncedDepartureAddress = useDebouncedValue(departureAddress, 600);
  const debouncedDestinationAddress = useDebouncedValue(
    destinationAddress,
    600
  );
  const debouncedWaypointAddresses = useDebouncedValue(
    waypoints.map((waypoint) => `${waypoint.id}:${waypoint.address}`).join("|"),
    600
  );
  const isEditMode = Boolean(initialData);

  const { mutateAsync: createRoute, isPending: isCreatePending } =
    useCreateRouteMutate();
  const { mutateAsync: updateRoute, isPending: isUpdatePending } =
    useEditRouteMutate(initialData?.id ?? "");

  useEffect(() => {
    if (!initialData) {
      setTitle("");
      setMemo("");
      setDepartureAddress("");
      setDestinationAddress("");
      setDepartureLat("");
      setDepartureLng("");
      setDestinationLat("");
      setDestinationLng("");
      setWaypoints([]);
      return;
    }

    setTitle(initialData.title);
    setMemo(initialData.content);
    setDepartureAddress("");
    setDestinationAddress("");
    setDepartureLat(
      initialData.departureLat !== undefined
        ? String(initialData.departureLat)
        : ""
    );
    setDepartureLng(
      initialData.departureLng !== undefined
        ? String(initialData.departureLng)
        : ""
    );
    setDestinationLat(
      initialData.destinationLat !== undefined
        ? String(initialData.destinationLat)
        : ""
    );
    setDestinationLng(
      initialData.destinationLng !== undefined
        ? String(initialData.destinationLng)
        : ""
    );
    setWaypoints(
      initialData.waypoints.map((waypoint) =>
        createWaypointDraft(String(waypoint.lat), String(waypoint.lng))
      )
    );
  }, [initialData]);

  const geocodeAddress = (
    address: string,
    applyCoordinate: (coordinate: PlaceGeocodeResponseData) => void,
    key: string
  ) => {
    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      return;
    }

    let cancelled = false;
    setGeocodingKey(key);

    void apiFetch<PlaceGeocodeResponseData>(
      `${API_PATHS.places.geocode}?query=${encodeURIComponent(trimmedAddress)}`
    )
      .then((response) => {
        if (!cancelled) {
          applyCoordinate(response.data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to geocode user route address", error);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setGeocodingKey(null);
        }
      });

    return () => {
      cancelled = true;
    };
  };

  useEffect(() => {
    return geocodeAddress(
      debouncedDepartureAddress,
      ({ lat, lng }) => {
        setDepartureLat(String(lat));
        setDepartureLng(String(lng));
      },
      "departure"
    );
  }, [debouncedDepartureAddress]);

  useEffect(() => {
    return geocodeAddress(
      debouncedDestinationAddress,
      ({ lat, lng }) => {
        setDestinationLat(String(lat));
        setDestinationLng(String(lng));
      },
      "destination"
    );
  }, [debouncedDestinationAddress]);

  useEffect(() => {
    const cleanupList = waypoints
      .filter((waypoint) => waypoint.address.trim())
      .map((waypoint) =>
        geocodeAddress(
          waypoint.address,
          ({ lat, lng }) => {
            setWaypoints((currentWaypoints) =>
              currentWaypoints.map((currentWaypoint) =>
                currentWaypoint.id === waypoint.id
                  ? {
                      ...currentWaypoint,
                      lat: String(lat),
                      lng: String(lng),
                    }
                  : currentWaypoint
              )
            );
          },
          waypoint.id
        )
      );

    return () => {
      cleanupList.forEach((cleanup) => cleanup?.());
    };
  }, [debouncedWaypointAddresses]);

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setFormErrorMessage(null);

        const parsedDepartureLat = parseCoordinateValue(departureLat);
        const parsedDepartureLng = parseCoordinateValue(departureLng);
        const parsedDestinationLat = parseCoordinateValue(destinationLat);
        const parsedDestinationLng = parseCoordinateValue(destinationLng);

        if (
          parsedDepartureLat === null ||
          parsedDepartureLng === null ||
          parsedDestinationLat === null ||
          parsedDestinationLng === null
        ) {
          setFormErrorMessage(
            "출발지와 도착지 주소 검색이 끝난 뒤 좌표가 확인되면 저장할 수 있습니다."
          );
          return;
        }

        const parsedWaypoints = waypoints.map((waypoint, index) => ({
          sequence: index + 1,
          lat: parseCoordinateValue(waypoint.lat),
          lng: parseCoordinateValue(waypoint.lng),
        }));

        if (
          parsedWaypoints.some(
            (waypoint) => waypoint.lat === null || waypoint.lng === null
          )
        ) {
          setFormErrorMessage("경유지 좌표가 모두 확인된 뒤 저장할 수 있습니다.");
          return;
        }

        const summary = buildSummaryFromMemo(memo, title);
        const payload = {
          title: title.trim(),
          summary,
          content: memo.trim() || summary,
          provider: "naver" as const,
          sourceType: "user" as const,
          departureRegion: mapAddressToRouteRegion(departureAddress),
          destinationRegion: mapAddressToRouteRegion(destinationAddress),
          departureLat: parsedDepartureLat,
          departureLng: parsedDepartureLng,
          destinationLat: parsedDestinationLat,
          destinationLng: parsedDestinationLng,
          tags: [],
          waypoints: parsedWaypoints.map((waypoint) => ({
            sequence: waypoint.sequence,
            lat: waypoint.lat as number,
            lng: waypoint.lng as number,
          })),
        };

        if (isEditMode) {
          void updateRoute(payload satisfies UpdateRouteBody)
            .then(() => {
              onSuccess?.();
            })
            .catch((error) => {
              setFormErrorMessage(
                error instanceof Error
                  ? error.message
                  : "경로 저장에 실패했습니다."
              );
            });
          return;
        }

        void createRoute(payload satisfies CreateRouteBody)
          .then(() => {
            onSuccess?.();
          })
          .catch((error) => {
            setFormErrorMessage(
              error instanceof Error
                ? error.message
                : "경로 저장에 실패했습니다."
            );
          });
      }}
    >
      <Input
        label="제목"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="예: 주말 새벽 남산 한 바퀴"
        required
      />
      <Input
        label="출발지"
        value={departureAddress}
        onChange={(event) => setDepartureAddress(event.target.value)}
        placeholder="예: 서울특별시 중구 세종대로 110"
        rightIcon={
          geocodingKey === "departure" ? (
            <span className="text-xs text-muted">검색 중</span>
          ) : undefined
        }
      />
      <Input
        label="도착지"
        value={destinationAddress}
        onChange={(event) => setDestinationAddress(event.target.value)}
        placeholder="예: 서울특별시 용산구 남산공원길 105"
        rightIcon={
          geocodingKey === "destination" ? (
            <span className="text-xs text-muted">검색 중</span>
          ) : undefined
        }
      />
      <div className="grid gap-3 rounded-3xl border border-border bg-panel-soft p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="m-0 text-sm font-semibold text-text">경로</p>
            <p className="m-0 text-xs text-muted">
              경유지를 순서대로 추가하면 사용자 경로로 저장됩니다.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setWaypoints((currentWaypoints) => [
                ...currentWaypoints,
                createWaypointDraft(),
              ])
            }
            disabled={waypoints.length >= 15}
          >
            경유지 추가
          </Button>
        </div>
        {waypoints.map((waypoint, index) => (
          <div
            key={waypoint.id}
            className="grid gap-2 md:grid-cols-[1fr_auto]"
          >
            <Input
              label={`경유지 ${index + 1}`}
              value={waypoint.address}
              onChange={(event) =>
                setWaypoints((currentWaypoints) =>
                  currentWaypoints.map((currentWaypoint) =>
                    currentWaypoint.id === waypoint.id
                      ? {
                          ...currentWaypoint,
                          address: event.target.value,
                        }
                      : currentWaypoint
                  )
                )
              }
              placeholder="예: 경기도 양평군 양서면"
              rightIcon={
                geocodingKey === waypoint.id ? (
                  <span className="text-xs text-muted">검색 중</span>
                ) : undefined
              }
            />
            <Button
              type="button"
              variant="ghost"
              className="self-end"
              onClick={() =>
                setWaypoints((currentWaypoints) =>
                  currentWaypoints.filter(
                    (currentWaypoint) => currentWaypoint.id !== waypoint.id
                  )
                )
              }
            >
              삭제
            </Button>
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-border bg-panel-soft p-4">
        <p className="m-0 text-sm font-semibold text-text">외부 경로 링크</p>
        <p className="mt-1 text-xs text-muted">
          입력한 출발지, 경유지, 도착지 좌표를 기준으로 네이버 경로 링크가
          자동 생성됩니다.
        </p>
      </div>
      <Textarea
        label="메모"
        value={memo}
        onChange={(event) => setMemo(event.target.value)}
        placeholder="내가 기억하고 싶은 경로 메모를 남겨 보세요."
        fieldClassName="min-h-[180px]"
      />

      {formErrorMessage ? (
        <Toast
          tone="danger"
          title="경로 저장 실패"
          description={formErrorMessage}
          onClose={() => setFormErrorMessage(null)}
        />
      ) : null}

      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            취소
          </Button>
        ) : null}
        <Button type="submit" loading={isCreatePending || isUpdatePending}>
          {submitLabel ?? (isEditMode ? "경로 수정" : "경로 등록")}
        </Button>
      </div>
    </form>
  );
}
