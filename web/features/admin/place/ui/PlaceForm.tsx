"use client";

import type {
  CreatePlaceResponseData,
  PlaceDetail,
  PlaceCategory,
  UpdatePlaceBody,
} from "@package-shared/types/place";
import { useEffect, useState } from "react";

import { placeCategoryOptions } from "@/entities/map/model/map-filters";
import { uploadImage } from "@/features/image/model/upload-image";
import { ApiClientError } from "@shared/api/http";
import {
  Button,
  ImageInput,
  Input,
  SelectInput,
  Textarea,
  Toast,
} from "@shared/ui";
import { useCreatePlace, useEditPlace } from "../model/use-place";
import { usePlaceGeocode } from "../model/use-place-geocode";

export function PlaceForm({
  initialData,
  onSuccess,
  onCancel,
}: {
  initialData?: PlaceDetail | null;
  onSuccess?: (data?: CreatePlaceResponseData) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<PlaceCategory>("gas");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [naverPlaceUrl, setNaverPlaceUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const isEditMode = Boolean(initialData);
  const normalizedAddress = address.trim();
  const initialNormalizedAddress = initialData?.address.trim() ?? "";
  const shouldAutofillCoordinates =
    !isEditMode || normalizedAddress !== initialNormalizedAddress;
  const geocodeQuery = usePlaceGeocode(address, shouldAutofillCoordinates);
  const {
    mutateAsync: createPlace,
    error: createPlaceError,
    isSuccess,
    data: successData,
    isPending,
  } = useCreatePlace();
  const {
    mutateAsync: editPlace,
    error: editPlaceError,
    isPending: isEditPending,
  } = useEditPlace(initialData?.id ?? "");
  const [dismissedToast, setDismissedToast] = useState<
    "success" | "error" | null
  >(null);

  const resetForm = () => {
    setName("");
    setCategory("gas");
    setAddress("");
    setPhone("");
    setDescription("");
    setLat("");
    setLng("");
    setNaverPlaceUrl("");
    setImages([]);
  };

  useEffect(() => {
    if (!initialData) {
      resetForm();
      return;
    }

    setName(initialData.name);
    setCategory(initialData.category);
    setAddress(initialData.address);
    setPhone(initialData.phone ?? "");
    setDescription(initialData.description ?? "");
    setLat(String(initialData.lat));
    setLng(String(initialData.lng));
    setNaverPlaceUrl(initialData.naverPlaceUrl);
    setImages(initialData.images ?? []);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      name: name.trim(),
      category,
      address: address.trim(),
      phone: phone.trim() || undefined,
      description: description.trim() || undefined,
      lat: Number(lat),
      lng: Number(lng),
      naverPlaceUrl: naverPlaceUrl.trim(),
      images: images.map((item) => item.trim()).filter(Boolean),
    };

    if (isEditMode) {
      await editPlace(payload satisfies UpdatePlaceBody);
      onSuccess?.();
      return;
    }

    const createdPlace = await createPlace(payload);
    resetForm();
    onSuccess?.(createdPlace.data);
  };

  const errorMessage =
    (editPlaceError instanceof ApiClientError
      ? editPlaceError.message
      : editPlaceError instanceof Error
      ? editPlaceError.message
      : null) ??
    (createPlaceError instanceof ApiClientError
      ? createPlaceError.message
      : createPlaceError instanceof Error
      ? createPlaceError.message
      : null);

  const geocodeErrorMessage =
    geocodeQuery.error instanceof ApiClientError
      ? geocodeQuery.error.message
      : geocodeQuery.error instanceof Error
      ? geocodeQuery.error.message
      : null;

  useEffect(() => {
    const geocoded = geocodeQuery.data?.data;
    if (!geocoded) {
      return;
    }

    setLat(String(geocoded.lat));
    setLng(String(geocoded.lng));
  }, [geocodeQuery.data]);

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <Input
        label="장소명"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="예: 북악 스카이웨이 주유소"
        required
      />
      <SelectInput
        label="카테고리"
        value={category}
        onValueChange={(nextValue) => setCategory(nextValue as PlaceCategory)}
        options={placeCategoryOptions}
      />
      <Input
        label="주소"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
        placeholder="도로명 주소"
        helperText={
          geocodeQuery.isFetching
            ? "주소를 기준으로 좌표를 찾는 중입니다."
            : geocodeErrorMessage
            ? geocodeErrorMessage
            : isEditMode && !shouldAutofillCoordinates
            ? "기존 저장 좌표를 유지합니다. 주소를 수정하면 위도/경도가 자동 갱신됩니다."
            : lat && lng
            ? "입력한 주소 기준으로 위도/경도가 자동 입력되었습니다."
            : "주소 입력 후 잠시 기다리면 위도/경도가 자동 입력됩니다."
        }
        required
      />
      <Input
        label="전화번호"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="선택 입력"
      />
      <Textarea
        label="설명"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="장소 소개, 추천 포인트"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="위도"
          value={lat}
          onChange={(event) => setLat(event.target.value)}
          placeholder="37.5665"
          required
        />
        <Input
          label="경도"
          value={lng}
          onChange={(event) => setLng(event.target.value)}
          placeholder="126.9780"
          required
        />
      </div>
      <Input
        label="네이버 플레이스 URL"
        value={naverPlaceUrl}
        onChange={(event) => setNaverPlaceUrl(event.target.value)}
        placeholder="https://..."
        required
      />
      <ImageInput
        label="이미지 업로드"
        value={images}
        onValueChange={(urls) => setImages(urls ?? [])}
        onUpload={async (file) => {
          const uploaded = await uploadImage(file);
          return uploaded.url;
        }}
      />

      {errorMessage && dismissedToast !== "error" && (
        <Toast
          tone="danger"
          title="장소등록 실패"
          description={errorMessage}
          onClose={() => setDismissedToast("error")}
        />
      )}

      {isSuccess && !isEditMode && (
        <Toast
          tone="success"
          title="장소등록 성공"
          description="새로운 장소가 지도에 등록되었습니다."
          onClose={() => setDismissedToast("success")}
        />
      )}

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" loading={isPending || isEditPending}>
          {isEditMode ? "장소 수정" : "장소 등록"}
        </Button>
      </div>
    </form>
  );
}
