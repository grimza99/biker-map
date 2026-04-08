"use client";

import {
  allowedCommunityCategoryOptions,
  type CommunityCategorySlug,
  type CreatePostBody,
  type CreatePostResponseData,
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
import { useCreateCommunityPost } from "../model/use-create-community-post";

type CommunityPostFormProps = {
  defaultCategory?: CommunityCategorySlug;
  submitLabel?: string;
  onSuccess?: (data: CreatePostResponseData) => void;
  onCancel?: () => void;
  className?: string;
};

export function CommunityPostForm({
  defaultCategory,
  submitLabel = "글 등록",
  onSuccess,
  onCancel,
  className,
}: CommunityPostFormProps) {
  const options = allowedCommunityCategoryOptions.map((option) => ({
    value: option.value,
    label: option.label,
  }));
  const [category, setCategory] = useState<CommunityCategorySlug>(
    defaultCategory ?? options[0]?.value ?? "question"
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([""]);
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
        setImages([""]);
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
          images: images.map((url) => url.trim()),
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

      {createPostMutation.isSuccess && dismissedToast !== "success" && (
        <Toast
          tone="success"
          title="게시글이 생성되었습니다."
          description="새 글이 커뮤니티 목록에 반영되었습니다."
          onClose={() => setDismissedToast("success")}
        />
      )}

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button variant="secondary" type="button" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" loading={createPostMutation.isPending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
