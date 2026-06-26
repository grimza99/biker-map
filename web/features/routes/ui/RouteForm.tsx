"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";

import {
  addressRegionMap,
  API_PATHS,
  buildCreateRoutePayload,
  buildUpdateRoutePayload,
  createRouteFormDefaultValues,
  RouteFormValues,
  RouteFormWaypointValue,
  type PlaceGeocodeResponseData,
  type RouteDetail,
  type RouteSourceType,
} from "@package-shared/index";

import { useDebouncedValue } from "@/shared/hooks";
import { useSession } from "@features/session";
import { apiFetch } from "@shared/api/http";
import { Button, Input, MarkdownEditor, SelectInput, Toast } from "@shared/ui";
import { routeFormSchema } from "../model/route-form-schemas";
import { useCreateRouteMutate, useEditRouteMutate } from "../model/use-route";

const sourceTypeOptions: Array<{ value: RouteSourceType; label: string }> = [
  { value: "curated", label: "운영자 큐레이션" },
];

function createWaypointDraft(
  lat = "",
  lng = "",
  address = ""
): RouteFormWaypointValue {
  return {
    draftId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    address,
    lat,
    lng,
  };
}

function createRouteDefaultValues(
  initialData?: RouteDetail | null
): RouteFormValues {
  if (!initialData) {
    return createRouteFormDefaultValues();
  }

  return {
    title: initialData.title,
    summary: initialData.summary,
    content: initialData.content,
    departureRegion: initialData.departureRegion ?? "seoul",
    destinationRegion: initialData.destinationRegion ?? "seoul",
    externalMapUrl: initialData.externalMapUrl,
    distanceKm:
      initialData.distanceKm !== undefined
        ? String(initialData.distanceKm)
        : "",
    estimatedDurationMinutes:
      initialData.estimatedDurationMinutes !== undefined
        ? String(initialData.estimatedDurationMinutes)
        : "",
    tags: initialData.tags.join(", "),
    sourceType: initialData.sourceType,
    departureAddress: "",
    destinationAddress: "",
    departureLat:
      initialData.departureLat !== undefined
        ? String(initialData.departureLat)
        : "",
    departureLng:
      initialData.departureLng !== undefined
        ? String(initialData.departureLng)
        : "",
    destinationLat:
      initialData.destinationLat !== undefined
        ? String(initialData.destinationLat)
        : "",
    destinationLng:
      initialData.destinationLng !== undefined
        ? String(initialData.destinationLng)
        : "",
    waypoints: initialData.waypoints.map((waypoint) =>
      createWaypointDraft(String(waypoint.lat), String(waypoint.lng))
    ),
  };
}

function formatCoordinate(lat: string, lng: string) {
  const parsedLat = parseCoordinateValue(lat);
  const parsedLng = parseCoordinateValue(lng);

  if (parsedLat === null || parsedLng === null) {
    return "좌표 미확인";
  }

  return `${parsedLat.toFixed(6)}, ${parsedLng.toFixed(6)}`;
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

function extractFirstMarkdownImageUrl(markdown: string) {
  const match = markdown.match(/!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
  return match?.[1];
}

export function RouteForm({
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
  const [geocodingKey, setGeocodingKey] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const form = useForm<RouteFormValues>({
    resolver: zodResolver(routeFormSchema),
    mode: "onChange",
    defaultValues: createRouteDefaultValues(initialData),
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "waypoints",
  });
  const departureAddress =
    useWatch({
      control: form.control,
      name: "departureAddress",
    }) ?? "";
  const destinationAddress =
    useWatch({
      control: form.control,
      name: "destinationAddress",
    }) ?? "";
  const waypoints =
    useWatch({
      control: form.control,
      name: "waypoints",
    }) ?? [];
  const waypointsRef = useRef(waypoints);
  const departureLat =
    useWatch({
      control: form.control,
      name: "departureLat",
    }) ?? "";
  const departureLng =
    useWatch({
      control: form.control,
      name: "departureLng",
    }) ?? "";
  const destinationLat =
    useWatch({
      control: form.control,
      name: "destinationLat",
    }) ?? "";
  const destinationLng =
    useWatch({
      control: form.control,
      name: "destinationLng",
    }) ?? "";
  const debouncedDepartureAddress = useDebouncedValue(departureAddress, 600);
  const debouncedDestinationAddress = useDebouncedValue(
    destinationAddress,
    600
  );
  const debouncedWaypointAddresses = useDebouncedValue(
    waypoints
      .map((waypoint) => `${waypoint.draftId}:${waypoint.address}`)
      .join("|"),
    600
  );
  const isEditMode = Boolean(initialData);
  const { session } = useSession();
  const isAdmin = session?.role === "admin";

  const { mutateAsync: createRoute, isPending: isCreatePending } =
    useCreateRouteMutate();
  const { mutateAsync: updateRoute, isPending: isUpdatePending } =
    useEditRouteMutate(initialData?.id ?? "");

  useEffect(() => {
    form.reset(createRouteDefaultValues(initialData));
  }, [form, initialData]);

  useEffect(() => {
    waypointsRef.current = waypoints;
  }, [waypoints]);

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
          console.error("Failed to geocode route address", error);
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
      ({ address, lat, lng }) => {
        form.setValue("departureLat", String(lat), {
          shouldDirty: true,
          shouldValidate: true,
        });
        form.setValue("departureLng", String(lng), {
          shouldDirty: true,
          shouldValidate: true,
        });
        const region = mapAddressToRouteRegion(address);
        if (region) {
          form.setValue("departureRegion", region, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      },
      "departure"
    );
  }, [debouncedDepartureAddress, form]);

  useEffect(() => {
    return geocodeAddress(
      debouncedDestinationAddress,
      ({ address, lat, lng }) => {
        form.setValue("destinationLat", String(lat), {
          shouldDirty: true,
          shouldValidate: true,
        });
        form.setValue("destinationLng", String(lng), {
          shouldDirty: true,
          shouldValidate: true,
        });
        const region = mapAddressToRouteRegion(address);
        if (region) {
          form.setValue("destinationRegion", region, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      },
      "destination"
    );
  }, [debouncedDestinationAddress, form]);

  useEffect(() => {
    const cleanupList = waypointsRef.current
      .filter((waypoint) => waypoint.address.trim())
      .map((waypoint) =>
        geocodeAddress(
          waypoint.address,
          ({ lat, lng }) => {
            const currentWaypointIndex = form
              .getValues("waypoints")
              .findIndex(
                (currentWaypoint) =>
                  currentWaypoint.draftId === waypoint.draftId
              );

            if (currentWaypointIndex < 0) {
              return;
            }

            form.setValue(
              `waypoints.${currentWaypointIndex}.lat`,
              String(lat),
              {
                shouldDirty: true,
                shouldValidate: true,
              }
            );
            form.setValue(
              `waypoints.${currentWaypointIndex}.lng`,
              String(lng),
              {
                shouldDirty: true,
                shouldValidate: true,
              }
            );
          },
          waypoint.draftId
        )
      );

    return () => {
      cleanupList.forEach((cleanup) => cleanup?.());
    };
  }, [debouncedWaypointAddresses, form]);

  const handleCreateSubmit = async (values: RouteFormValues) => {
    const payload = buildCreateRoutePayload(
      values,
      extractFirstMarkdownImageUrl(values.content)
    );

    if (!payload.success) {
      setFormErrorMessage(payload.message);
      return;
    }

    try {
      setFormErrorMessage(null);
      await createRoute(payload.data);
      form.reset(createRouteFormDefaultValues());
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create route", error);
      setFormErrorMessage(
        error instanceof Error ? error.message : "경로 등록에 실패했습니다."
      );
    }
  };

  const handleEditSubmit = async (values: RouteFormValues) => {
    const payload = buildUpdateRoutePayload(
      values,
      extractFirstMarkdownImageUrl(values.content) ?? null
    );

    if (!payload.success) {
      setFormErrorMessage(payload.message);
      return;
    }

    try {
      setFormErrorMessage(null);
      await updateRoute(payload.data);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update route", error);
      setFormErrorMessage(
        error instanceof Error ? error.message : "경로 수정에 실패했습니다."
      );
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    if (isEditMode) {
      await handleEditSubmit(values);
      return;
    }

    await handleCreateSubmit(values);
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
      noValidate
    >
      <Input
        label="경로명"
        placeholder="예: 서울 북부 야간 루트"
        required
        errorText={form.formState.errors.title?.message}
        {...form.register("title")}
      />
      <Input
        label="소개"
        placeholder="리스트 카드에 보여줄 짧은 소개"
        required
        errorText={form.formState.errors.summary?.message}
        {...form.register("summary")}
      />
      <div className="grid gap-2">
        <Controller
          control={form.control}
          name="content"
          render={({ field, fieldState }) => (
            <div className="grid gap-2">
              <MarkdownEditor
                label="상세 소개"
                value={field.value}
                onChange={field.onChange}
              />
              {fieldState.error?.message ? (
                <p className="m-0 text-xs font-medium leading-5 text-danger">
                  {fieldState.error.message}
                </p>
              ) : null}
            </div>
          )}
        />
        <p className="m-0 text-xs leading-5 text-muted">
          경로 이미지는 에디터 우측 상단의 이미지 업로드 버튼으로 본문에
          삽입됩니다. 첫 번째 본문 이미지는 경로 카드의 썸네일로도 재사용됩니다.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Controller
          control={form.control}
          name="sourceType"
          render={({ field, fieldState }) => (
            <SelectInput
              label="출처"
              value={field.value}
              onValueChange={(nextValue) =>
                field.onChange(nextValue as RouteSourceType)
              }
              options={sourceTypeOptions}
              errorText={fieldState.error?.message}
            />
          )}
        />
        <Input label="지도 제공자" value="네이버 지도" disabled />
      </div>

      <div className="grid gap-4 rounded-3xl border border-border bg-panel-soft p-4">
        <div>
          <p className="m-0 text-sm font-semibold text-text">경로 주소</p>
        </div>

        <Input
          label="출발지 주소"
          placeholder="예: 서울특별시 중구 세종대로 110"
          rightIcon={
            geocodingKey === "departure" ? (
              <span className="text-xs text-muted">검색 중</span>
            ) : undefined
          }
          {...form.register("departureAddress")}
        />

        <Input
          label="도착지 주소"
          placeholder="예: 부산광역시 해운대구 우동"
          rightIcon={
            geocodingKey === "destination" ? (
              <span className="text-xs text-muted">검색 중</span>
            ) : undefined
          }
          {...form.register("destinationAddress")}
        />

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="m-0 text-sm font-semibold text-text">경유지 주소</p>
              <p className="m-0 text-xs text-muted">
                네이버 Directions 15 기준 최대 15개까지 등록됩니다.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => append(createWaypointDraft())}
              disabled={fields.length >= 15}
            >
              경유지 추가
            </Button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="grid gap-2 md:grid-cols-[1fr_auto]">
              <Input
                label={`경유지 ${index + 1} 주소`}
                placeholder="예: 경기도 양평군 양서면"
                rightIcon={
                  geocodingKey === waypoints[index]?.draftId ? (
                    <span className="text-xs text-muted">검색 중</span>
                  ) : undefined
                }
                {...form.register(`waypoints.${index}.address`)}
              />
              <Button
                type="button"
                variant="ghost"
                className="self-end"
                onClick={() => remove(index)}
              >
                삭제
              </Button>
            </div>
          ))}
          {form.formState.errors.waypoints?.message ? (
            <p className="m-0 text-xs font-medium leading-5 text-danger">
              {form.formState.errors.waypoints.message}
            </p>
          ) : null}
        </div>

        {isAdmin ? (
          <div className="grid gap-2 rounded-2xl border border-border bg-background/40 p-3 text-xs text-muted">
            <p className="m-0 font-semibold text-text">좌표 요약</p>
            <p className="m-0">
              출발지: {formatCoordinate(departureLat, departureLng)}
            </p>
            {waypoints.map((waypoint, index) => (
              <p key={waypoint.draftId} className="m-0">
                경유지 {index + 1}:{" "}
                {formatCoordinate(waypoint.lat, waypoint.lng)}
              </p>
            ))}
            <p className="m-0">
              도착지: {formatCoordinate(destinationLat, destinationLng)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="외부 지도 URL"
          placeholder="https://..."
          required
          errorText={form.formState.errors.externalMapUrl?.message}
          {...form.register("externalMapUrl")}
        />
        <Input
          label="예상 소요 시간 (분)"
          placeholder="예: 50"
          errorText={form.formState.errors.estimatedDurationMinutes?.message}
          {...form.register("estimatedDurationMinutes")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="태그"
          placeholder="야간, 카페, 초심자 (쉼표 구분)"
          errorText={form.formState.errors.tags?.message}
          {...form.register("tags")}
        />
        <Input
          label="거리 (km)"
          placeholder="예: 24.5"
          errorText={form.formState.errors.distanceKm?.message}
          {...form.register("distanceKm")}
        />
      </div>

      {formErrorMessage && (
        <Toast
          tone="danger"
          title="경로 저장 실패"
          description={formErrorMessage}
          onClose={() => setFormErrorMessage(null)}
        />
      )}

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button
          type="submit"
          loading={
            isCreatePending || isUpdatePending || form.formState.isSubmitting
          }
          disabled={
            !form.formState.isValid || isCreatePending || isUpdatePending
          }
        >
          {submitLabel ?? (isEditMode ? "경로 수정" : "경로 등록")}
        </Button>
      </div>
    </form>
  );
}
