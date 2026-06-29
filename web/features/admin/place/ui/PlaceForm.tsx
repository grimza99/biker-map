"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import {
  ApiClientError,
  CreatePlaceResponseData,
  PlaceCategory,
  PlaceDetail,
  PlaceFormInput,
  PlaceFormValues,
  TOAST_MESSAGE,
  UpdatePlaceBody,
  createPlaceDefaultValues,
  placeCrudCategoryOptions,
} from "@biker-map/package-shared";

import { uploadImage } from "@/features/image/model/upload-image";
import {
  Button,
  ImageInput,
  Input,
  SelectInput,
  Textarea,
  useToast,
} from "@shared/ui";
import {
  placeFormSchema,
  useCreatePlace,
  useEditPlace,
  usePlaceGeocode,
} from "../model";

export function PlaceForm({
  initialData,
  onSuccess,
  onCancel,
}: {
  initialData?: PlaceDetail | null;
  onSuccess?: (data?: CreatePlaceResponseData) => void;
  onCancel?: () => void;
}) {
  const isEditMode = Boolean(initialData);
  const form = useForm<PlaceFormInput, unknown, PlaceFormValues>({
    resolver: zodResolver(placeFormSchema),
    mode: "onChange",
    defaultValues: createPlaceDefaultValues(initialData),
  });
  const address =
    useWatch({
      control: form.control,
      name: "address",
    }) ?? "";
  const lat =
    useWatch({
      control: form.control,
      name: "lat",
    }) ?? "";
  const lng =
    useWatch({
      control: form.control,
      name: "lng",
    }) ?? "";
  const normalizedAddress = address.trim();
  const initialNormalizedAddress = initialData?.address.trim() ?? "";
  const shouldAutofillCoordinates =
    !isEditMode || normalizedAddress !== initialNormalizedAddress;
  const geocodeQuery = usePlaceGeocode(address, shouldAutofillCoordinates);

  const {
    mutateAsync: createPlace,
    error: createPlaceError,
    isPending,
  } = useCreatePlace();

  const {
    mutateAsync: editPlace,
    error: editPlaceError,
    isPending: isEditPending,
  } = useEditPlace(initialData?.id ?? "");

  const { showToast } = useToast();

  useEffect(() => {
    form.reset(createPlaceDefaultValues(initialData));
  }, [form, initialData]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = values;

    if (isEditMode) {
      await editPlace(payload satisfies UpdatePlaceBody);
      onSuccess?.();
      return;
    }

    const createdPlace = await createPlace(payload);
    form.reset(createPlaceDefaultValues());
    onSuccess?.(createdPlace.data);
  });

  const errorMessage =
    isEditMode && editPlaceError
      ? editPlaceError.message
      : !isEditMode && createPlaceError
      ? createPlaceError.message
      : null;

  const geocodeErrorMessage =
    geocodeQuery.error instanceof ApiClientError && geocodeQuery.error.message;

  useEffect(() => {
    const geocoded = geocodeQuery.data?.data;
    if (!geocoded) {
      return;
    }

    form.setValue("lat", String(geocoded.lat), {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("lng", String(geocoded.lng), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [form, geocodeQuery.data]);

  useEffect(() => {
    if (geocodeErrorMessage) {
      showToast({
        title: TOAST_MESSAGE.ADMIN.GEOCODING.E,
        description: geocodeErrorMessage,
        tone: "danger",
      });
    }
    if (errorMessage) {
      showToast({
        title: TOAST_MESSAGE.ADMIN.E,
        description: errorMessage,
        tone: "danger",
      });
    }
  }, [errorMessage, geocodeErrorMessage, showToast]);

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
        label="장소명"
        placeholder="예: 북악 스카이웨이 주유소"
        required
        errorText={form.formState.errors.name?.message}
        {...form.register("name")}
      />
      <Controller
        control={form.control}
        name="category"
        render={({ field, fieldState }) => (
          <SelectInput
            label="카테고리"
            value={field.value}
            onValueChange={(nextValue) =>
              field.onChange(nextValue as PlaceCategory)
            }
            options={placeCrudCategoryOptions}
            errorText={fieldState.error?.message}
          />
        )}
      />
      <Input
        label="주소"
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
        errorText={form.formState.errors.address?.message}
        {...form.register("address")}
      />
      <Input
        label="전화번호"
        placeholder="선택 입력"
        errorText={form.formState.errors.phone?.message}
        {...form.register("phone")}
      />
      <Textarea
        label="설명"
        placeholder="장소 소개, 추천 포인트"
        errorText={form.formState.errors.description?.message}
        {...form.register("description")}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="위도"
          placeholder="37.5665"
          required
          errorText={form.formState.errors.lat?.message}
          {...form.register("lat")}
        />
        <Input
          label="경도"
          placeholder="126.9780"
          required
          errorText={form.formState.errors.lng?.message}
          {...form.register("lng")}
        />
      </div>
      <Input
        label="네이버 플레이스 URL"
        placeholder="https://..."
        required
        errorText={form.formState.errors.naverPlaceUrl?.message}
        {...form.register("naverPlaceUrl")}
      />
      <Controller
        control={form.control}
        name="images"
        render={({ field, fieldState }) => (
          <ImageInput
            label="이미지 업로드"
            value={field.value}
            onValueChange={(urls) => field.onChange(urls ?? [])}
            onUpload={async (file) => {
              const uploaded = await uploadImage(file);
              return uploaded.url;
            }}
            errorText={fieldState.error?.message}
          />
        )}
      />

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button
          type="submit"
          loading={isPending || isEditPending || form.formState.isSubmitting}
          disabled={!form.formState.isValid || isPending || isEditPending}
        >
          {isEditMode ? "장소 수정" : "장소 등록"}
        </Button>
      </div>
    </form>
  );
}
