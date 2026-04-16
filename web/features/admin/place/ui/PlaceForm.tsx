"use client";

import type {
  CreatePlaceResponseData,
  PlaceCategory,
} from "@package-shared/types/place";
import { useEffect, useState } from "react";

import { placeCategoryOptions } from "@/entities/map/model/map-filters";
import { uploadImage } from "@/features/image/model/upload-image";
import { Button, ImageInput, Input, SelectInput, Textarea, useToast } from "@shared/ui";
import { useCreatePlace } from "../model/use-place";
import { usePlaceGeocode } from "../model/use-place-geocode";

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
  const [images, setImages] = useState<string[]>([]);
  const { showToast } = useToast();
  const geocodeQuery = usePlaceGeocode(address);
  const { mutateAsync: createPlace, isPending } = useCreatePlace();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const createdPlace = await createPlace({
        name: name.trim(),
        category,
        address: address.trim(),
        phone: phone.trim() || undefined,
        description: description.trim() || undefined,
        lat: Number(lat),
        lng: Number(lng),
        naverPlaceUrl: naverPlaceUrl.trim(),
        images: images.map((item) => item.trim()).filter(Boolean),
      });

      setName("");
      setCategory("gas");
      setAddress("");
      setPhone("");
      setDescription("");
      setLat("");
      setLng("");
      setNaverPlaceUrl("");
      setImages([]);
      showToast({
        tone: "success",
        title: "장소등록 성공",
        description: "새로운 장소가 지도에 등록되었습니다.",
      });
      onSuccess?.(createdPlace.data);
    } catch (error) {
      showToast({
        tone: "danger",
        title: "장소등록 실패",
        description:
          error instanceof Error ? error.message : "장소를 등록하지 못했습니다.",
      });
    }
  };

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
            : geocodeQuery.error instanceof Error
            ? geocodeQuery.error.message
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
