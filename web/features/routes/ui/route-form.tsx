"use client";

import {
  RouteRegion,
  routeRegionOptions,
  type CreateRouteBody,
  type RouteDetail,
  type RouteProvider,
  type RouteSourceType,
  type UpdateRouteBody,
} from "@package-shared/index";
import { useEffect, useState } from "react";

import {
  Button,
  ImageInput,
  Input,
  MarkdownEditor,
  SelectInput,
} from "@shared/ui";
import { useCreateRouteMutate, useEditRouteMutate } from "../model/use-route";

const providerOptions: Array<{ value: RouteProvider; label: string }> = [
  { value: "naver", label: "네이버 지도" },
  { value: "etc", label: "기타" },
];

const sourceTypeOptions: Array<{ value: RouteSourceType; label: string }> = [
  { value: "curated", label: "운영자 큐레이션" },
  { value: "user", label: "사용자 경로" },
];

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
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [departureRegion, setDepartureRegion] = useState<RouteRegion>("seoul");
  const [destinationRegion, setDestinationRegion] =
    useState<RouteRegion>("seoul");
  const [provider, setProvider] = useState<RouteProvider>("naver");
  const [externalMapUrl, setExternalMapUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState("");
  const [tags, setTags] = useState("");
  const [sourceType, setSourceType] = useState<RouteSourceType>("curated");
  const isEditMode = Boolean(initialData);

  const { mutateAsync: createRoute, isPending: isCreatePending } =
    useCreateRouteMutate();
  const { mutateAsync: updateRoute, isPending: isUpdatePending } =
    useEditRouteMutate(initialData?.id ?? "");

  const resetForm = () => {
    setTitle("");
    setSummary("");
    setContent("");
    setDepartureRegion("seoul");
    setDestinationRegion("seoul");
    setProvider("naver");
    setExternalMapUrl("");
    setThumbnailUrl("");
    setDistanceKm("");
    setEstimatedDurationMinutes("");
    setTags("");
    setSourceType("curated");
  };

  useEffect(() => {
    if (!initialData) {
      resetForm();
      return;
    }

    setTitle(initialData.title);
    setSummary(initialData.summary);
    setContent(initialData.content);
    setDepartureRegion(initialData.departureRegion ?? "seoul");
    setDestinationRegion(initialData.destinationRegion ?? "seoul");
    setProvider(initialData.provider);
    setExternalMapUrl(initialData.externalMapUrl);
    setThumbnailUrl(initialData.thumbnailUrl ?? "");
    setDistanceKm(
      initialData.distanceKm !== undefined ? String(initialData.distanceKm) : ""
    );
    setEstimatedDurationMinutes(
      initialData.estimatedDurationMinutes !== undefined
        ? String(initialData.estimatedDurationMinutes)
        : ""
    );
    setTags(initialData.tags.join(", "));
    setSourceType(initialData.sourceType);
  }, [initialData]);

  const handleCreateSubmit = async (payload: CreateRouteBody) => {
    try {
      await createRoute(payload);
      resetForm();
      onSuccess?.();
    } catch {
      console.error("Failed to update route");
    }
  };

  const handleEditSubmit = async (payload: UpdateRouteBody) => {
    try {
      await updateRoute(payload);
      onSuccess?.();
    } catch {
      console.error("Failed to update route");
    }
  };

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();

        const payload = {
          title,
          summary,
          content,
          departureRegion,
          destinationRegion,
          provider,
          externalMapUrl: externalMapUrl.trim(),
          thumbnailUrl: thumbnailUrl.trim() || undefined,
          distanceKm: distanceKm ? Number(distanceKm) : undefined,
          estimatedDurationMinutes: estimatedDurationMinutes
            ? Number(estimatedDurationMinutes)
            : undefined,
          tags: tags
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          sourceType,
        };
        if (isEditMode) {
          handleEditSubmit(payload);
        } else {
          handleCreateSubmit(payload);
        }
      }}
    >
      <Input
        label="경로명"
        value={title}
        onChange={(event) => setTitle(event.target.value.trim())}
        placeholder="예: 서울 북부 야간 루트"
        required
      />
      <Input
        label="소개"
        value={summary}
        onChange={(event) => setSummary(event.target.value.trim)}
        placeholder="리스트 카드에 보여줄 짧은 소개"
        required
      />
      <MarkdownEditor label="상세 소개" value={content} onChange={setContent} />

      <div className="grid gap-4 md:grid-cols-2">
        <SelectInput
          label="출발 지역"
          value={departureRegion}
          onValueChange={(nextValue) =>
            setDepartureRegion(nextValue as RouteRegion)
          }
          options={routeRegionOptions}
        />
        <SelectInput
          label="도착 지역"
          value={destinationRegion}
          onValueChange={(nextValue) =>
            setDestinationRegion(nextValue as RouteRegion)
          }
          options={routeRegionOptions}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SelectInput
          label="출처"
          value={sourceType}
          onValueChange={(nextValue) =>
            setSourceType(nextValue as RouteSourceType)
          }
          options={sourceTypeOptions}
        />
        <SelectInput
          label="지도 제공자"
          value={provider}
          onValueChange={(nextValue) => setProvider(nextValue as RouteProvider)}
          options={providerOptions}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="외부 지도 URL"
          value={externalMapUrl}
          onChange={(event) => setExternalMapUrl(event.target.value)}
          placeholder="https://..."
          required
        />
        <Input
          label="예상 소요 시간 (분)"
          value={estimatedDurationMinutes}
          onChange={(event) => setEstimatedDurationMinutes(event.target.value)}
          placeholder="예: 50"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="태그"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="야간, 카페, 초심자 (쉼표 구분)"
        />
        <Input
          label="거리 (km)"
          value={distanceKm}
          onChange={(event) => setDistanceKm(event.target.value)}
          placeholder="예: 24.5"
        />
      </div>

      <ImageInput
        label="썸네일"
        value={thumbnailUrl}
        onValueChange={(value) => setThumbnailUrl(value ? value[0] : "")}
        maxImages={1}
      />

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" loading={isCreatePending || isUpdatePending}>
          {submitLabel ?? (isEditMode ? "경로 수정" : "경로 등록")}
        </Button>
      </div>
    </form>
  );
}
