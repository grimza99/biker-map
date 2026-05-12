"use client";

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

import { uploadImage } from "@/features/image";
import { Button, ImageInput, Input, SelectInput, Textarea } from "@shared/ui";
import { useState } from "react";
import { useCreateCommunityPost } from "../model/use-post";

type CommunityPostFormProps = {
  allowedCategories?: CommunityCategorySlug[];
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
  className?: string;
};

export function CommunityPostForm({
  allowedCategories = allowedCommunityCategoryOptions.map(
    (option) => option.value
  ),
  defaultCategory,
  submitLabel = "글 등록",
  initialValues,
  onSubmit,
  onSuccess,
  onCancel,
  className,
}: CommunityPostFormProps) {
  const options = communityCategoryOptions.filter((option) =>
    allowedCategories.includes(option.value)
  );
  const [category, setCategory] = useState<CommunityCategorySlug>(
    initialValues?.category ??
      defaultCategory ??
      options[0]?.value ??
      "question"
  );
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [images, setImages] = useState(initialValues?.images ?? []);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPostMutation = useCreateCommunityPost();

  async function handleSubmit(payload: CreatePostBody | UpdatePostBody) {
    if (onSubmit) {
      try {
        setIsSubmitting(true);
        const response = await onSubmit(payload);
        onSuccess?.("data" in response ? response.data : response);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    createPostMutation.mutate(payload as CreatePostBody, {
      onSuccess(response) {
        setTitle("");
        setContent("");
        setImages([]);
        setCategory(defaultCategory ?? options[0]?.value ?? "question");
        onSuccess?.(response.data);
      },
    });
  }

  return (
    <form
      className={className ?? "grid gap-4"}
      onSubmit={(event) => {
        event.preventDefault();
        if (isImageUploading) {
          return;
        }

        const payload: CreatePostBody | UpdatePostBody = {
          category,
          title: title.trim(),
          content: content.trim(),
          images: images.map((url) => url.trim()).filter(Boolean),
        };

        void handleSubmit(payload);
      }}
    >
      <SelectInput
        label="카테고리"
        value={category}
        onValueChange={(nextValue) =>
          setCategory(nextValue as CommunityCategorySlug)
        }
        options={options}
      />

      <Input
        label="제목"
        placeholder="게시글 제목을 입력하세요"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />

      <Textarea
        label="본문"
        placeholder="내용을 입력하세요"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        required
        fieldClassName="min-h-[220px]"
        helperText="게시글 본문은 최소 1자 이상 입력해야 합니다."
      />

      <ImageInput
        label="이미지 업로드"
        value={images}
        onValueChange={(urls) => setImages(urls ?? [])}
        onUploadingChange={setIsImageUploading}
        onUpload={async (file) => {
          const uploaded = await uploadImage(file);
          return uploaded.url;
        }}
        disabled={isSubmitting || createPostMutation.isPending}
      />

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button variant="secondary" type="button" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button
          type="submit"
          loading={
            isImageUploading || isSubmitting || createPostMutation.isPending
          }
          disabled={isImageUploading}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
