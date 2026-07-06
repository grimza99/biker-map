import { allowedCommunityCategoryOptions } from "src/model";
import { CommunityCategorySlug, CreatePostBody } from "src/types";
import { z } from "zod";
import { SCHEMA_ATOM } from "./schema-atom";

type CreateCommunityPostFormDefaultValuesParams = {
  allowedCategories?: CommunityCategorySlug[];
  defaultCategory?: CommunityCategorySlug;
  initialValues?: Partial<CreatePostBody>;
};

export const communityPostFormSchema = z.object({
  category: SCHEMA_ATOM.community.category,
  title: SCHEMA_ATOM.requiredString("제목을 입력해 주세요."),
  content: SCHEMA_ATOM.requiredString("본문을 입력해 주세요."),
  images: z
    .array(z.string().trim().min(1))
    .max(5, "이미지는 최대 5장까지 업로드할 수 있습니다."),
}) satisfies z.ZodType<CreatePostBody>;

export function createCommunityPostFormDefaultValues({
  allowedCategories = allowedCommunityCategoryOptions.map(
    (option) => option.value
  ),
  defaultCategory,
  initialValues,
}: CreateCommunityPostFormDefaultValuesParams = {}): CreatePostBody {
  const fallbackCategory =
    resolveAllowedCategory(initialValues?.category, allowedCategories) ??
    resolveAllowedCategory(defaultCategory, allowedCategories) ??
    allowedCategories[0] ??
    "question";

  return {
    category: fallbackCategory,
    title: initialValues?.title ?? "",
    content: initialValues?.content ?? "",
    images: initialValues?.images ?? [],
  };
}

function resolveAllowedCategory(
  value: CommunityCategorySlug | undefined,
  allowedCategories: CommunityCategorySlug[]
) {
  if (!value) {
    return null;
  }

  return allowedCategories.includes(value) ? value : null;
}

export const updatePostSchema = z
  .object({
    category: SCHEMA_ATOM.community.category.optional(),
    title: SCHEMA_ATOM.optional.trimmedString,
    content: SCHEMA_ATOM.optional.string,
    images: z.array(z.string()).optional(),
  })
  .refine(
    (value) =>
      value.category !== undefined ||
      value.title !== undefined ||
      value.content !== undefined ||
      value.images !== undefined,
    {
      message: "수정할 항목이 필요합니다.",
    }
  );
