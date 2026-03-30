export const communityCategories = [
  { slug: "notice", label: "공지", hint: "운영 / 안내" },
  { slug: "question", label: "질문", hint: "정보 요청" },
  { slug: "review", label: "후기", hint: "경험 공유" },
  { slug: "info", label: "정보", hint: "팁 / 정리" },
  { slug: "ride", label: "동행", hint: "모임 / 동행" }
] as const;

export type CommunityCategorySlug = (typeof communityCategories)[number]["slug"];

export type CommunityPost = {
  id: string;
  category: CommunityCategorySlug;
  title: string;
  excerpt: string;
  author: string;
  timeLabel: string;
  commentCount: number;
  likeCount: number;
  pinned?: boolean;
};

export const communityPosts: CommunityPost[] = [
  {
    id: "post-001",
    category: "notice",
    title: "이번 주 커뮤니티 운영 가이드",
    excerpt: "신규 글 등록 전 확인할 항목과 신고 대응 기준을 정리했습니다.",
    author: "운영진",
    timeLabel: "5분 전",
    commentCount: 4,
    likeCount: 12,
    pinned: true
  },
  {
    id: "post-002",
    category: "question",
    title: "서울권 야간 주유소 추천 부탁드립니다",
    excerpt: "밤 11시 이후에도 운영하는 곳 위주로 찾고 있습니다.",
    author: "민준",
    timeLabel: "18분 전",
    commentCount: 8,
    likeCount: 9
  },
  {
    id: "post-003",
    category: "review",
    title: "북악 스카이웨이 주말 오전 후기",
    excerpt: "초입 도로 상태와 카페 대기 시간을 함께 적어두었습니다.",
    author: "서연",
    timeLabel: "1시간 전",
    commentCount: 6,
    likeCount: 21
  },
  {
    id: "post-004",
    category: "info",
    title: "비 오는 날 체인 관리 체크리스트",
    excerpt: "작업 순서, 필요한 공구, 주행 전 확인 포인트를 정리했습니다.",
    author: "지훈",
    timeLabel: "2시간 전",
    commentCount: 2,
    likeCount: 17
  },
  {
    id: "post-005",
    category: "ride",
    title: "토요일 저녁 인천-김포 동행 모집",
    excerpt: "초보도 무리 없는 속도로 함께 달릴 분을 찾습니다.",
    author: "수아",
    timeLabel: "오늘",
    commentCount: 11,
    likeCount: 15
  }
];

export function getCommunityCategory(slug: string) {
  return communityCategories.find((category) => category.slug === slug);
}

export function getCommunityPostsByCategory(category?: CommunityCategorySlug) {
  if (!category) {
    return communityPosts;
  }

  return communityPosts.filter((post) => post.category === category);
}
