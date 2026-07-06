"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  allowedCommunityCategoryOptions,
  communityCategoryOptions,
  communityPostFormSchema,
  createCommunityPostFormDefaultValues,
  type ApiResponse,
  type CommunityCategorySlug,
  type CreatePostBody,
  type CreatePostResponseData,
  type UpdatePostBody,
  type UpdatePostResponseData,
} from "@package-shared/index";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { uploadImage } from "@/features/image";
import { Button, ImageInput, Input, SelectInput, Textarea } from "@shared/ui";
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
  const options = useMemo(
    () =>
      communityCategoryOptions.filter((option) =>
        allowedCategories.includes(option.value)
      ),
    [allowedCategories]
  );
  const normalizedInitialValues = useMemo(
    () => ({
      category: initialValues?.category,
      title: initialValues?.title ?? "",
      content: initialValues?.content ?? "",
      images: initialValues?.images ?? [],
    }),
    [
      initialValues?.category,
      initialValues?.title,
      initialValues?.content,
      initialValues?.images,
    ]
  );
  const defaultValues = useMemo(
    () =>
      createCommunityPostFormDefaultValues({
        allowedCategories,
        defaultCategory,
        initialValues: normalizedInitialValues,
      }),
    [allowedCategories, defaultCategory, normalizedInitialValues]
  );
  const resetKey = useMemo(
    () =>
      JSON.stringify({
        allowedCategories,
        defaultCategory: defaultCategory ?? null,
        initialValues: normalizedInitialValues,
      }),
    [allowedCategories, defaultCategory, normalizedInitialValues]
  );
  const [isImageUploading, setIsImageUploading] = useState(false);
  const createPostMutation = useCreateCommunityPost();
  const form = useForm<CreatePostBody>({
    resolver: zodResolver(communityPostFormSchema),
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

  async function handleSubmit(values: CreatePostBody) {
    if (!allowedCategories.includes(values.category)) {
      form.setError("category", {
        type: "validate",
        message: "선택할 수 없는 카테고리입니다.",
      });
      return;
    }

    const payload: CreatePostBody | UpdatePostBody = {
      category: values.category,
      title: values.title,
      content: values.content,
      images: values.images,
    };

    if (onSubmit) {
      const response = await onSubmit(payload);
      onSuccess?.("data" in response ? response.data : response);
      return;
    }

    const createPayload: CreatePostBody = {
      category: values.category,
      title: values.title,
      content: values.content,
      images: values.images,
    };

    createPostMutation.mutate(createPayload, {
      onSuccess(response) {
        form.reset(
          createCommunityPostFormDefaultValues({
            allowedCategories,
            defaultCategory,
          })
        );
        onSuccess?.(response.data);
      },
    });
  }

  const formSubmit = form.handleSubmit(async (values) => {
    await handleSubmit(values);
  });

  return (
    <form
      className={className ?? "grid gap-4"}
      onSubmit={(event) => {
        event.preventDefault();
        void formSubmit();
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
            onValueChange={(urls) => {
              field.onChange(urls ?? []);
              void form.trigger("images");
            }}
            onUploadingChange={setIsImageUploading}
            onUpload={async (file) => {
              const uploaded = await uploadImage(file);
              return uploaded.url;
            }}
            disabled={
              form.formState.isSubmitting || createPostMutation.isPending
            }
            errorText={fieldState.error?.message}
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
          loading={
            isImageUploading ||
            form.formState.isSubmitting ||
            createPostMutation.isPending
          }
          disabled={isImageUploading}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
