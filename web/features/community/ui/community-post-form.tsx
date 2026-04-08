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

import { ApiClientError } from "@shared/api/http";
import {
  Button,
  ImageInput,
  Input,
  SelectInput,
  Textarea,
  Toast,
} from "@shared/ui";
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
  const [dismissedToast, setDismissedToast] = useState<
    "success" | "error" | null
  >(null);
  const [customError, setCustomError] = useState<string | null>(null);
  const [customSuccess, setCustomSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPostMutation = useCreateCommunityPost();

  async function handleSubmit(payload: CreatePostBody | UpdatePostBody) {
    setDismissedToast(null);
    setCustomError(null);
    setCustomSuccess(false);

    if (onSubmit) {
      try {
        setIsSubmitting(true);
        const response = await onSubmit(payload);
        setCustomSuccess(true);
        onSuccess?.("data" in response ? response.data : response);
      } catch (error) {
        setCustomError(
          error instanceof ApiClientError
            ? error.message
            : error instanceof Error
            ? error.message
            : "요청을 처리하지 못했습니다."
        );
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

  const createError = createPostMutation.error;
  const errorMessage =
    customError ??
    (createError instanceof ApiClientError
      ? createError.message
      : createError instanceof Error
      ? createError.message
      : null);

  return (
    <form
      className={className ?? "grid gap-4"}
      onSubmit={(event) => {
        event.preventDefault();

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
      />
      {errorMessage && dismissedToast !== "error" && (
        <Toast
          tone="danger"
          title="게시글 생성에 실패했습니다."
          description={errorMessage}
          onClose={() => setDismissedToast("error")}
        />
      )}

      {(customSuccess || createPostMutation.isSuccess) &&
        dismissedToast !== "success" && (
          <Toast
            tone="success"
            title={
              onSubmit ? "게시글이 수정되었습니다." : "게시글이 생성되었습니다."
            }
            description={
              onSubmit
                ? "수정한 내용이 게시글에 반영되었습니다."
                : "새 글이 커뮤니티 목록에 반영되었습니다."
            }
            onClose={() => setDismissedToast("success")}
          />
        )}

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button variant="secondary" type="button" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button
          type="submit"
          loading={isSubmitting || createPostMutation.isPending}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
