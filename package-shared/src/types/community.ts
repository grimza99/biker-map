export type CommunityCategorySlug = "notice" | "question" | "info" | "free";

export type CommunityPost = {
  id: string;
  category: CommunityCategorySlug;
  title: string;
  excerpt: string;
  author: string;
  timeLabel: string;
  commentCount: number;
  viewCount: number;
  pinned?: boolean;
};

export type CommunityPostsQuery = {
  category?: CommunityCategorySlug;
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: "latest" | "views";
};

export type CommunityPostAuthor = {
  id?: string;
  name: string;
};

export type CommunityPostDetail = {
  id: string;
  category: CommunityCategorySlug;
  title: string;
  content: string;
  author: CommunityPostAuthor;
  timeLabel: string;
  commentCount: number;
  viewCount: number;
  pinned?: boolean;
  images?: string[];
};

export type CommunityReply = {
  id: string;
  parentCommentId: string;
  author: CommunityPostAuthor;
  content: string;
  timeLabel: string;
};

export type CommunityComment = {
  id: string;
  postId: string;
  author: CommunityPostAuthor;
  content: string;
  timeLabel: string;
  replyCount: number;
  replies: CommunityReply[];
};

export type PostsListResponseData = {
  items: CommunityPost[];
};

export type PostDetailResponseData = CommunityPostDetail;

export type PostCommentsResponseData = {
  items: CommunityComment[];
};

export type CreatePostBody = {
  category: CommunityCategorySlug;
  title: string;
  content: string;
  images?: string[];
};

export type CreatePostResponseData = {
  id: string;
  createdAt: string;
};

export type UpdatePostBody = {
  category?: CommunityCategorySlug;
  title?: string;
  content?: string;
  images?: string[];
};

export type UpdatePostResponseData = {
  id: string;
  updatedAt: string;
};

export type DeletePostResponseData = {
  id: string;
  deleted: true;
};

export type CreatePostCommentBody = {
  content: string;
};

export type CreatePostCommentResponseData = {
  id: string;
  postId: string;
  createdAt: string;
};

export type UpdateCommentBody = {
  content: string;
};

export type UpdateCommentResponseData = {
  id: string;
  updatedAt: string;
};

export type DeleteCommentResponseData = {
  id: string;
  deleted: true;
};

export type CommentReplyBody = {
  content: string;
};

export type CommentReplyResponseData = {
  id: string;
  parentCommentId: string;
  createdAt: string;
};
