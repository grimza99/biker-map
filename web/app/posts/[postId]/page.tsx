"use client";
import { ApiClientError, formatDateByType } from "@/shared";
import { CommunityEngagementBar } from "@/widgets";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import Comment from "@/entities/community/ui/Comment";
import { useCommunityPostComments } from "@/features/community/model/use-comments";
import { FavoriteHeartButton } from "@/features/favorites/ui/FavoriteHeartButton";

import {
  useDeleteCommunityPost,
  useUpdateCommunityPost,
} from "@/features/community/model/use-post";
import CommentForm from "@/features/community/ui/CommentForm";
import { CommunityPostForm } from "@features/community";
import { useCommunityPostDetail } from "@features/community/model/use-community-post-detail";
import { useSession } from "@features/session/model/use-session";
import {
  Button,
  Chip,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  Divider,
  ErrorState,
  LoadingState,
  MetaCounts,
  PageWrapper,
  Profile,
  useToast,
} from "@shared/ui";
import { MessageSquare } from "lucide-react";

export default function PostDetailPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const postId = params?.postId ?? "";
  const { status, session } = useSession();
  const { showToast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const {
    data: detailpostData,
    isLoading,
    isError,
    error,
  } = useCommunityPostDetail(postId);
  const commentsQuery = useCommunityPostComments(postId);
  const comments = commentsQuery.data?.data.items ?? [];

  const post = detailpostData?.data;
  const updatePostMutation = useUpdateCommunityPost(postId);
  const deletePostMutation = useDeleteCommunityPost(postId);

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
  const isOwner = Boolean(
    session?.userId && post.author.id && session.userId === post.author.id
  );
  return (
    <PageWrapper>
      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-start justify-between gap-3">
          <Chip label={post.category} />
          <div className="flex items-center gap-2">
            <FavoriteHeartButton
              targetType="post"
              targetId={post.id}
              favorited={post.favorited}
              favoriteId={post.favoriteId}
            />
            {isOwner && (
              <>
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsEditOpen(true)}
                  >
                    게시글 수정
                  </Button>
                  <DialogContent size="lg" className="border border-border">
                    <DialogHeader
                      title={
                        <span className="text-lg font-semibold text-text">
                          게시글 수정
                        </span>
                      }
                    />
                    <DialogBody className="pt-0">
                      <CommunityPostForm
                        submitLabel="수정하기"
                        initialValues={{
                          category: post.category,
                          title: post.title,
                          content: post.content,
                          images: post.images ?? [],
                        }}
                        onSubmit={(payload) =>
                          updatePostMutation.mutateAsync({
                            category: payload.category,
                            title: payload.title,
                            content: payload.content,
                            images: payload.images,
                          })
                        }
                        onSuccess={() => {
                          setIsEditOpen(false);
                        }}
                        onCancel={() => setIsEditOpen(false)}
                      />
                    </DialogBody>
                  </DialogContent>
                </Dialog>
                <Button
                  size="sm"
                  variant="ghost"
                  loading={deletePostMutation.isPending}
                  onClick={async () => {
                    const confirmed =
                      window.confirm("이 게시글을 삭제하시겠습니까?");
                    if (!confirmed) {
                      return;
                    }

                    try {
                      await deletePostMutation.mutateAsync(undefined);
                      router.replace("/posts");
                    } catch (error) {
                      showToast({
                        tone: "danger",
                        title: "게시글을 삭제하지 못했습니다.",
                        description:
                          error instanceof ApiClientError
                            ? error.message
                            : error instanceof Error
                            ? error.message
                            : "게시글을 삭제하지 못했습니다.",
                      });
                    }
                  }}
                >
                  게시글 삭제
                </Button>
              </>
            )}
          </div>
        </div>
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
        {post.images?.length && (
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
        )}
        <CommunityEngagementBar
          targetType="post"
          targetId={post.id}
          reactions={post.reactions}
          postId={post.id}
          disabled={status !== "authenticated"}
          leadingSlot={
            <span className="inline-flex items-center gap-1 text-sm text-muted">
              <MessageSquare className="h-4 w-4" />
              댓글 {post.commentCount}
            </span>
          }
        />
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
