"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { uploadImage } from "@/features/image";
import { Button, ImageInput, Input, SelectInput, Textarea } from "@shared/ui";
import {
  communityPostFormSchema,
  type CommunityPostFormInput,
  type CommunityPostFormValues,
} from "../model/community-form-schemas";
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
  const createPostMutation = useCreateCommunityPost();
  const [firstCategoryOption] = options;
  const [isImageUploading, setIsImageUploading] = useState(false);
  const form = useForm<CommunityPostFormInput, unknown, CommunityPostFormValues>({
    resolver: zodResolver(communityPostFormSchema),
    mode: "onChange",
    defaultValues: {
      category:
        initialValues?.category ??
        defaultCategory ??
        firstCategoryOption?.value ??
        "question",
      title: initialValues?.title ?? "",
      content: initialValues?.content ?? "",
      images: initialValues?.images ?? [],
    },
  });

  useEffect(() => {
    form.reset({
      category:
        initialValues?.category ??
        defaultCategory ??
        firstCategoryOption?.value ??
        "question",
      title: initialValues?.title ?? "",
      content: initialValues?.content ?? "",
      images: initialValues?.images ?? [],
    });
  }, [defaultCategory, firstCategoryOption?.value, form, initialValues]);

  const isSubmitting = form.formState.isSubmitting;
  const isPending = createPostMutation.isPending;

  const handleSubmit = form.handleSubmit(async (values) => {
    if (onSubmit) {
      const response = await onSubmit(values);
      onSuccess?.("data" in response ? response.data : response);
      return;
    }

    createPostMutation.mutate(values, {
      onSuccess(response) {
        form.reset({
          category: defaultCategory ?? firstCategoryOption?.value ?? "question",
          title: "",
          content: "",
          images: [],
        });
        onSuccess?.(response.data);
      },
    });
  });

  return (
    <form
      className={className ?? "grid gap-4"}
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
      noValidate
    >
      <Controller
        control={form.control}
        name="category"
        render={({ field, fieldState }) => (
          <SelectInput
            label="카테고리"
            value={field.value}
            onValueChange={(nextValue) =>
              field.onChange(nextValue as CommunityCategorySlug)
            }
            options={options}
            errorText={fieldState.error?.message}
          />
        )}
      />

      <Input
        label="제목"
        placeholder="게시글 제목을 입력하세요"
        required
        errorText={form.formState.errors.title?.message}
        {...form.register("title")}
      />

      <Textarea
        label="본문"
        placeholder="내용을 입력하세요"
        required
        fieldClassName="min-h-[220px]"
        helperText="게시글 본문은 최소 1자 이상 입력해야 합니다."
        errorText={form.formState.errors.content?.message}
        {...form.register("content")}
      />

      <Controller
        control={form.control}
        name="images"
        render={({ field, fieldState }) => (
          <ImageInput
            label="이미지 업로드"
            value={field.value}
            onValueChange={(urls) => field.onChange(urls ?? [])}
            onUploadingChange={setIsImageUploading}
            onUpload={async (file) => {
              const uploaded = await uploadImage(file);
              return uploaded.url;
            }}
            errorText={fieldState.error?.message}
            disabled={isSubmitting || isPending}
          />
        )}
      />

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button variant="secondary" type="button" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button
          type="submit"
          loading={isSubmitting || isPending || isImageUploading}
          disabled={!form.formState.isValid || isSubmitting || isPending || isImageUploading}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
