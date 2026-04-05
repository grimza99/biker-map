import type { CommunityCategorySlug } from "@package-shared/types/community";

export const communityCategoryOptions: Array<{
  value: CommunityCategorySlug;
  label: string;
  description: string;
}> = [
  { value: "notice", label: "공지", description: "운영 공지 및 안내" },
  { value: "question", label: "질문", description: "정보 요청과 질문" },
  { value: "info", label: "정보", description: "팁과 정보 공유" },
  { value: "free", label: "자유", description: "잡담과 자유 주제" },
];
