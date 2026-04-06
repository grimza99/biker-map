import type { CommunityCategorySlug } from "@package-shared/types/community";

export const communityCategoryOptions: Array<{
  value: CommunityCategorySlug;
  label: string;
}> = [
  { value: "notice", label: "공지" },
  { value: "question", label: "질문" },
  { value: "info", label: "정보" },
  { value: "free", label: "자유" },
];
