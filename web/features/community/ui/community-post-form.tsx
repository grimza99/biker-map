"use client";

import type {
  CommunityCategorySlug,
  CreatePostBody,
  CreatePostResponseData,
} from "@package-shared/types/community";
import { useMemo, useState } from "react";

import { ApiClientError } from "@shared/api/http";
import { Button, Input, SelectInput, Textarea, Toast } from "@shared/ui";

import { communityCategoryOptions } from "../model/category-options";
import { useCreateCommunityPost } from "../model/use-create-community-post";

type CommunityPostFormProps = {
  allowedCategories?: CommunityCategorySlug[];
  defaultCategory?: CommunityCategorySlug;
  submitLabel?: string;
  onSuccess?: (data: CreatePostResponseData) => void;
  onCancel?: () => void;
  className?: string;
};

export function CommunityPostForm({
  allowedCategories = ["question", "info", "free"],
  defaultCategory,
  submitLabel = "글 등록",
  onSuccess,
  onCancel,
  className,
}: CommunityPostFormProps) {
  const options = useMemo(
    () =>
      communityCategoryOptions
        .filter((option) => allowedCategories.includes(option.value))
        .map((option) => ({
          value: option.value,
          label: option.label,
        })),
    [allowedCategories]
  );

  const [category, setCategory] = useState<CommunityCategorySlug>(
    defaultCategory ?? options[0]?.value ?? "question"
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState("");
  const [dismissedToast, setDismissedToast] = useState<
    "success" | "error" | null
  >(null);

  const createPostMutation = useCreateCommunityPost();

  function handleSubmit(payload: CreatePostBody) {
    setDismissedToast(null);

    createPostMutation.mutate(payload, {
      onSuccess(response) {
        setTitle("");
        setContent("");
        setImages("");
        setCategory(defaultCategory ?? options[0]?.value ?? "question");
        onSuccess?.(response.data);
      },
    });
  }

  const errorMessage =
    createPostMutation.error instanceof ApiClientError
      ? createPostMutation.error.message
      : createPostMutation.error instanceof Error
        ? createPostMutation.error.message
        : null;

  return (
    <form
      className={className ?? "grid gap-4"}
      onSubmit={(event) => {
        event.preventDefault();

        const payload: CreatePostBody = {
          category,
          title: title.trim(),
          content: content.trim(),
          images: images
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
        };

        handleSubmit(payload);
      }}
    >
      <SelectInput
        label="카테고리"
        value={category}
        onValueChange={(nextValue) =>
          setCategory(nextValue as CommunityCategorySlug)
        }
        options={options}
        helperText="작성할 게시판을 선택하세요."
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

      <Textarea
        label="이미지 URL"
        placeholder="이미지 URL을 줄바꿈으로 구분해 입력하세요"
        value={images}
        onChange={(event) => setImages(event.target.value)}
        helperText="MVP에서는 이미지 업로드 대신 URL 입력으로 처리합니다."
        fieldClassName="min-h-[120px]"
      />

      {errorMessage && dismissedToast !== "error" ? (
        <Toast
          tone="danger"
          title="게시글 생성에 실패했습니다."
          description={errorMessage}
          onClose={() => setDismissedToast("error")}
        />
      ) : null}

      {createPostMutation.isSuccess && dismissedToast !== "success" ? (
        <Toast
          tone="success"
          title="게시글이 생성되었습니다."
          description="새 글이 커뮤니티 목록에 반영되었습니다."
          onClose={() => setDismissedToast("success")}
        />
      ) : null}

      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <Button variant="secondary" type="button" onClick={onCancel}>
            취소
          </Button>
        ) : null}
        <Button type="submit" loading={createPostMutation.isPending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
