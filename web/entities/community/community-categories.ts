import { CommunityCategorySlug } from "@package-shared/types/community";

export const communityCategories = [
  { slug: "notice", label: "공지", hint: "운영 / 안내" },
  { slug: "question", label: "질문", hint: "정보 요청" },
  { slug: "info", label: "정보", hint: "팁 / 정리" },
  { slug: "free", label: "자유 게시판", hint: "자유 / 잡담" },
] as const satisfies ReadonlyArray<{
  slug: CommunityCategorySlug;
  label: string;
  hint: string;
}>;
