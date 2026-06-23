import { Alert, View } from "react-native";
import { useState } from "react";

import {
  allowedCommunityCategoryOptions,
  communityCategoryOptions,
  type ApiResponse,
  type CommunityCategorySlug,
  type CreatePostBody,
  type CreatePostResponseData,
  type UpdatePostBody,
  type UpdatePostResponseData,
} from "@package-shared/index";

import {
  AppText,
  Button,
  ImageInput,
  type ImageInputAsset,
  Input,
} from "@/components/common";
import { SelectInput } from "@/shared";
import { uploadImage } from "@/features/image";
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

const MAX_POST_IMAGES = 2;
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
  const [category, setCategory] = useState<CommunityCategorySlug>(
    initialValues?.category ??
      defaultCategory ??
      OPTIONS[0]?.value ??
      "question"
  );
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [images, setImages] = useState<ImageInputAsset[]>(
    mapInitialImageUrls(initialValues?.images)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState<string>();
  const [contentError, setContentError] = useState<string>();

  async function handleSubmit() {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const nextTitleError = trimmedTitle ? undefined : "제목을 입력해주세요.";
    const nextContentError = trimmedContent
      ? undefined
      : "본문을 1자 이상 입력해주세요.";

    setTitleError(nextTitleError);
    setContentError(nextContentError);

    if (nextTitleError || nextContentError) {
      return;
    }

    try {
      setIsSubmitting(true);
      const uploadedImageUrls = await Promise.all(
        images.map(async (asset) => {
          if (isRemoteImageUri(asset.uri)) {
            return asset.uri;
          }

          const uploaded = await uploadImage(asset);
          return uploaded.url;
        })
      );

      const payload: CreatePostBody | UpdatePostBody = {
        category,
        title: trimmedTitle,
        content: trimmedContent,
        images: uploadedImageUrls,
      };

      const response = onSubmit
        ? await onSubmit(payload)
        : await createPostMutation.mutateAsync(payload as CreatePostBody);
      const resolved = "data" in response ? response.data : response;

      onSuccess?.(resolved);

      if (!onSubmit) {
        setTitle("");
        setContent("");
        setImages([]);
        setCategory(defaultCategory ?? OPTIONS[0]?.value ?? "question");
      }
    } catch (error) {
      Alert.alert(
        "게시글 저장 실패",
        error instanceof Error ? error.message : "오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const isPending = isSubmitting || createPostMutation.isPending;

  return (
    <View className="gap-4">
      <SelectInput
        label="카테고리"
        options={OPTIONS}
        value={category}
        onValueChange={(nextValue) =>
          setCategory(nextValue as CommunityCategorySlug)
        }
      />

      <Input
        label="제목"
        placeholder="게시글 제목을 입력하세요"
        value={title}
        onChangeText={(value) => {
          setTitle(value);
          if (titleError && value.trim()) {
            setTitleError(undefined);
          }
        }}
        errorText={titleError}
        editable={!isPending}
      />

      <Input
        label="본문"
        placeholder="내용을 입력하세요"
        value={content}
        onChangeText={(value) => {
          setContent(value);
          if (contentError && value.trim()) {
            setContentError(undefined);
          }
        }}
        errorText={contentError}
        helperText="게시글 본문은 최소 1자 이상 입력해야 합니다."
        editable={!isPending}
        multiline
        numberOfLines={10}
      />

      <ImageInput
        label="이미지 업로드"
        value={images}
        onValueChange={(value) => setImages(value ?? [])}
        maxImages={MAX_POST_IMAGES}
        disabled={isPending}
        helperText={`최대 ${MAX_POST_IMAGES}장까지 업로드할 수 있습니다.`}
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
