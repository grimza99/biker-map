"use client";
import { useParams } from "next/navigation";

import Comment from "@/entities/community/ui/Comment";
import { useCommunityPostComments } from "@/features/community/model/use-comments";
import CommentForm from "@/features/community/ui/CommentForm";
import { useCommunityPostDetail } from "@features/community/model/use-community-post-detail";
import { useSession } from "@features/session/model/use-session";
import { formatDateByType } from "@shared/lib";
import {
  Divider,
  ErrorState,
  LoadingState,
  MetaCounts,
  PageWrapper,
  Profile,
  StatusChip,
} from "@shared/ui";

export default function PostDetailPage() {
  const params = useParams<{ postId: string }>();
  const postId = params?.postId ?? "";
  const { status } = useSession();
  const {
    data: detailpostData,
    isLoading,
    isError,
    error,
  } = useCommunityPostDetail(postId);
  const commentsQuery = useCommunityPostComments(postId);
  const comments = commentsQuery.data?.data.items ?? [];

  const post = detailpostData?.data;

  if (isLoading) {
    return <LoadingState label="게시글을 불러오는 중" />;
  }

  if (isError || !post) {
    return (
      <PageWrapper className="p-6" innerClassName="gap-5">
        <ErrorState
          title="게시글을 불러오지 못했습니다"
          message={error instanceof Error ? error.message : undefined}
        />
      </PageWrapper>
    );
  }

  const timeLabel = formatDateByType(post.timeLabel, "dateTime");
  return (
    <PageWrapper>
      <div className="flex flex-col gap-3 w-full">
        <StatusChip statusLabel={post.category} />
        <h1 className="m-0 text-[clamp(28px,4vw,42px)] font-semibold tracking-[-0.04em] text-text">
          {post.title}
        </h1>
        <div className="flex flex-col gap-3 text-sm text-muted w-full items-end justify-center">
          <Profile
            name={post.author.name}
            className="w-auto gap-2 pr-3"
            imgClassName="h-7 w-7"
          />
          <div className="flex items-center gap-4">
            <MetaCounts
              commentCount={post.commentCount}
              viewCount={post.viewCount}
            />
            <span className="text-xs">{timeLabel}</span>
          </div>
        </div>
      </div>
      <div className="grid gap-4">
        <p className="m-0 whitespace-pre-wrap leading-8 text-text/92">
          {post.content}
        </p>
        {/* {post.images?.length && (
          <div className="grid gap-2">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              첨부 이미지
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              {post.images.map((image) => (
                <a
                  key={image}
                  href={image}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-border bg-panel-solid px-4 py-3 text-sm text-accent transition hover:-translate-y-0.5"
                >
                  {image}
                </a>
              ))}
            </div>
          </div>
        )} */}
      </div>

      <Divider />
      {/* 댓글영역 */}
      <CommentForm postId={postId} disabled={status !== "authenticated"} />
      {comments.length > 0 && (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <Comment key={comment.id} postId={postId} comment={comment} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
