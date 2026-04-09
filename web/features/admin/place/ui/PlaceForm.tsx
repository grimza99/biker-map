"use client";

import type {
  CreatePlaceResponseData,
  PlaceCategory,
} from "@package-shared/types/place";
import { useState } from "react";

import { placeCategoryOptions } from "@/entities/map/model/map-filters";
import { ApiClientError } from "@shared/api/http";
import { Button, Input, SelectInput, Textarea, Toast } from "@shared/ui";
import { useCreatePlace } from "../model/use-place";

export function PlaceForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: (data: CreatePlaceResponseData) => void;
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
  const [images, setImages] = useState("");
  const {
    mutateAsync: createPlace,
    error: createPlaceError,
    isSuccess,
    data: successData,
    isPending,
  } = useCreatePlace();
  const [dismissedToast, setDismissedToast] = useState<
    "success" | "error" | null
  >(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await createPlace({
      name: name.trim(),
      category,
      address: address.trim(),
      phone: phone.trim() || undefined,
      description: description.trim() || undefined,
      lat: Number(lat),
      lng: Number(lng),
      naverPlaceUrl: naverPlaceUrl.trim(),
      images: images
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    });

    if (isSuccess && successData) {
      setName("");
      setCategory("gas");
      setAddress("");
      setPhone("");
      setDescription("");
      setLat("");
      setLng("");
      setNaverPlaceUrl("");
      setImages("");
      onSuccess?.(successData.data);
    }
  };

  const errorMessage =
    createPlaceError instanceof ApiClientError
      ? createPlaceError.message
      : createPlaceError instanceof Error
      ? createPlaceError.message
      : null;

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
      <Textarea
        label="이미지 URL"
        value={images}
        onChange={(event) => setImages(event.target.value)}
        placeholder="이미지 URL을 줄바꿈으로 구분해 입력"
      />

      {errorMessage && dismissedToast !== "error" && (
        <Toast
          tone="danger"
          title="장소등록 실패"
          description={errorMessage}
          onClose={() => setDismissedToast("error")}
        />
      )}

      {isSuccess && (
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
        <Button type="submit" loading={isPending}>
          장소 등록
        </Button>
      </div>
    </form>
  );
}
