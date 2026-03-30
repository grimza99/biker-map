export type CommunityCategorySlug = "notice" | "question" | "review" | "info" | "free";

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
