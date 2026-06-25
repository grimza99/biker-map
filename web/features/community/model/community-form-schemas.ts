"use client";

import {
  type CommunityCategorySlug,
  type CreatePostCommentBody,
} from "@package-shared/index";
import { z } from "zod";

const communityCategorySchema = z.enum([
  "notice",
  "question",
  "info",
  "free",
]) satisfies z.ZodType<CommunityCategorySlug>;

const imageUrlSchema = z.string().trim().url("이미지 URL 형식이 올바르지 않습니다.");

export const communityPostFormSchema = z.object({
  category: communityCategorySchema,
  title: z
    .string()
    .trim()
    .min(1, "제목을 입력해주세요."),
  content: z
    .string()
    .trim()
    .min(1, "본문을 입력해주세요."),
  images: z
    .array(imageUrlSchema)
    .default([])
    .transform((images) => images.filter(Boolean)),
});

export type CommunityPostFormInput = z.input<typeof communityPostFormSchema>;
export type CommunityPostFormValues = z.output<typeof communityPostFormSchema>;

export const commentFormSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "댓글을 입력해주세요."),
}) satisfies z.ZodType<CreatePostCommentBody>;

export type CommentFormValues = z.infer<typeof commentFormSchema>;
