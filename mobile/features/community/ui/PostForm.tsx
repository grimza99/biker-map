import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, View } from "react-native";

import {
  allowedCommunityCategoryOptions,
  communityCategoryOptions,
  communityPostDraftFormSchema,
  communityPostFormSchema,
  createCommunityPostFormDefaultValues,
  type ApiResponse,
  type CommunityCategorySlug,
  type CommunityPostFormInput,
  type CreatePostBody,
  type CreatePostResponseData,
  type UpdatePostBody,
  type UpdatePostResponseData,
} from "@package-shared/index";

import { AppText, Button } from "@/components/common";
import { uploadImage } from "@/features/image";
import { ImageInput, ImageInputAsset, Input, SelectInput } from "@/shared";
import { useCreateCommunityPost } from "../model";

type IPostFormProps = {
  defaultCategory?: CommunityCategorySlug;
  submitLabel?: string;
  initialValues?: Partial<CreatePostBody>;
  onSubmit?: (
    payload: CreatePostBody | UpdatePostBody
  ) => Promise<
    | ApiResponse<CreatePostResponseData>
    | ApiResponse<UpdatePostResponseData>
    | CreatePostResponseData
    | UpdatePostResponseData
  >;
  onSuccess?: (data: CreatePostResponseData | UpdatePostResponseData) => void;
  onCancel?: () => void;
};

const MAX_POST_IMAGES = 5;
const ALLOWED_CATEGORIES = allowedCommunityCategoryOptions.map(
  (option) => option.value
);
const OPTIONS = communityCategoryOptions
  .filter((option) => ALLOWED_CATEGORIES.includes(option.value))
  .map((option) => ({
    label: option.label,
    value: option.value,
  }));

export function PostForm({
  defaultCategory,
  submitLabel = "글 등록",
  initialValues,
  onSubmit,
  onSuccess,
  onCancel,
}: IPostFormProps) {
  const createPostMutation = useCreateCommunityPost();
  const normalizedInitialValues = useMemo(
    () => ({
      category: initialValues?.category,
      title: initialValues?.title ?? "",
      content: initialValues?.content ?? "",
      images: initialValues?.images ?? [],
    }),
    [
      initialValues?.category,
      initialValues?.content,
      initialValues?.images,
      initialValues?.title,
    ]
  );
  const defaultValues = useMemo<CommunityPostFormInput>(
    () => ({
      ...createCommunityPostFormDefaultValues({
        allowedCategories: ALLOWED_CATEGORIES,
        defaultCategory,
        initialValues: normalizedInitialValues,
      }),
      images: mapInitialImageUrls(normalizedInitialValues.images),
    }),
    [defaultCategory, normalizedInitialValues]
  );
  const resetKey = useMemo(
    () =>
      JSON.stringify({
        defaultCategory: defaultCategory ?? null,
        initialValues: normalizedInitialValues,
      }),
    [defaultCategory, normalizedInitialValues]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<CommunityPostFormInput>({
    resolver: zodResolver(communityPostDraftFormSchema),
    mode: "onChange",
    defaultValues,
  });
  const lastResetKeyRef = useRef(resetKey);

  useEffect(() => {
    if (lastResetKeyRef.current === resetKey) {
      return;
    }

    lastResetKeyRef.current = resetKey;
    form.reset(defaultValues);
  }, [defaultValues, form, resetKey]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      setIsSubmitting(true);
      const uploadedImageUrls = await Promise.all(
        values.images.map(async (asset) => {
          if (isRemoteImageUri(asset.uri)) {
            return asset.uri;
          }

          const uploaded = await uploadImage(asset);
          return uploaded.url;
        })
      );

      const payload = communityPostFormSchema.parse({
        category: values.category,
        title: values.title,
        content: values.content,
        images: uploadedImageUrls,
      }) as CreatePostBody | UpdatePostBody;

      const response = onSubmit
        ? await onSubmit(payload)
        : await createPostMutation.mutateAsync(payload as CreatePostBody);
      const resolved = "data" in response ? response.data : response;

      onSuccess?.(resolved);

      if (!onSubmit) {
        form.reset({
          ...createCommunityPostFormDefaultValues({
            allowedCategories: ALLOWED_CATEGORIES,
            defaultCategory,
          }),
          images: [],
        });
      }
    } catch (error) {
      Alert.alert(
        "게시글 저장 실패",
        error instanceof Error ? error.message : "오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  const isPending = isSubmitting || createPostMutation.isPending;

  return (
    <View className="gap-4">
      <Controller
        control={form.control}
        name="category"
        render={({ field, fieldState }) => (
          <SelectInput
            label="카테고리"
            options={OPTIONS}
            value={field.value}
            onValueChange={(nextValue) =>
              field.onChange(nextValue as CommunityCategorySlug)
            }
            errorText={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={form.control}
        name="title"
        render={({ field, fieldState }) => (
          <Input
            label="제목"
            placeholder="게시글 제목을 입력하세요"
            value={field.value}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            errorText={fieldState.error?.message}
            editable={!isPending}
          />
        )}
      />

      <Controller
        control={form.control}
        name="content"
        render={({ field, fieldState }) => (
          <Input
            label="본문"
            placeholder="내용을 입력하세요"
            value={field.value}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            errorText={fieldState.error?.message}
            helperText="게시글 본문은 최소 1자 이상 입력해야 합니다."
            editable={!isPending}
            multiline
            numberOfLines={10}
          />
        )}
      />

      <Controller
        control={form.control}
        name="images"
        render={({ field, fieldState }) => (
          <ImageInput
            label="이미지 업로드"
            value={field.value}
            onValueChange={(value) => field.onChange(value ?? [])}
            maxImages={MAX_POST_IMAGES}
            disabled={isPending}
            errorText={fieldState.error?.message}
            helperText={`최대 ${MAX_POST_IMAGES}장까지 업로드할 수 있습니다.`}
          />
        )}
      />

      <View className="flex-row items-center justify-end gap-2">
        {onCancel ? (
          <Button
            variant="secondary"
            onPress={onCancel}
            disabled={isPending}
            size="md"
          >
            취소
          </Button>
        ) : null}

        <Button
          onPress={() => void handleSubmit()}
          disabled={!form.formState.isValid || isPending}
          loading={isPending}
          size="md"
        >
          <AppText className="text-sm font-extrabold">{submitLabel}</AppText>
        </Button>
      </View>
    </View>
  );
}

function mapInitialImageUrls(imageUrls?: string[]): ImageInputAsset[] {
  return (imageUrls ?? []).map((imageUrl, index) => ({
    id: imageUrl,
    name: `existing-image-${index + 1}.jpg`,
    uri: imageUrl,
  }));
}

function isRemoteImageUri(uri: string) {
  return /^https?:\/\//.test(uri);
}
