import { useSession } from "@/features";
import {
  useDeletePostComment,
  useUpdatePostComment,
} from "@/features/community/model/use-comments";
import {
  useDeleteCommentReply,
  useUpdateCommentReply,
} from "@/features/community/model/use-reply";
import { CommentEditForm } from "@/features/community/ui/CommentEditForm";
import {
  Button,
  DefaultCardContainer,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Profile,
} from "@/shared";
import { CommunityEngagementBar } from "@/widgets";
import { CommunityComment, CommunityReply } from "@package-shared/index";
import { MessageSquare, ReplyIcon } from "lucide-react";
import { useState } from "react";

export interface CommentCardProps {
  postId: string;
  content: CommunityComment | CommunityReply;
  onClickShowReplyForm?: () => void;
  disabled?: boolean;
}
export function CommentCard({
  postId,
  content,
  onClickShowReplyForm,
  disabled,
}: CommentCardProps) {
  const isReply = "parentCommentId" in content;
  const { session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isOwner = Boolean(
    session?.userId && session.userId === content.author.id
  );
  const updateCommentMutation = useUpdatePostComment(postId, content.id);
  const updateReplyMutation = useUpdateCommentReply(postId, content.id);
  const deleteCommentMutation = useDeletePostComment(postId, content.id);
  const deleteReplyMutation = useDeleteCommentReply(postId, content.id);
  const updateMutation = isReply ? updateReplyMutation : updateCommentMutation;
  const deleteMutation = isReply ? deleteReplyMutation : deleteCommentMutation;

  return (
    <>
      <DefaultCardContainer
        className="p-3 gap-2"
        footer={
          <CommunityEngagementBar
            targetType="comment"
            targetId={content.id}
            reactions={content.reactions}
            postId={postId}
            disabled={disabled}
            leadingSlot={
              !isReply ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1.5 px-2.5 text-xs text-primary"
                    disabled={disabled}
                    onClick={onClickShowReplyForm}
                  >
                    <ReplyIcon className="h-4 w-4" />
                    답글 달기
                  </Button>
                  <span className="inline-flex items-center gap-1 text-xs text-muted">
                    <MessageSquare className="h-4 w-4" />
                    {content.replyCount}
                  </span>
                </>
              ) : null
            }
          />
        }
      >
        <div className="flex items-center justify-between gap-3">
          <Profile
            name={content.author.name}
            avatarUrl={content.author.avatarUrl}
            className="w-auto gap-2 p-0 border-none bg-transparent"
            imgClassName="h-7 w-7"
          />
          <div className="flex items-center gap-2">
            {isOwner || session?.role === "admin" ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => setIsEditing((current) => !current)}
                  disabled={deleteMutation.isPending}
                >
                  수정
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-danger"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={updateMutation.isPending}
                >
                  삭제
                </Button>
              </>
            ) : null}
            <span className="text-xs text-muted">{content.timeLabel}</span>
          </div>
        </div>
        {isEditing ? (
          <CommentEditForm
            initialValue={content.content}
            isPending={updateMutation.isPending}
            error={updateMutation.error}
            onCancel={() => setIsEditing(false)}
            onSubmit={(nextContent) => {
              updateMutation.mutate(
                { content: nextContent },
                {
                  onSuccess: () => setIsEditing(false),
                }
              );
            }}
          />
        ) : (
          <p className="m-0 whitespace-pre-wrap text-sm leading-7 text-text/92">
            {content.content}
          </p>
        )}
      </DefaultCardContainer>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent size="sm">
          <DialogHeader title={isReply ? "답글 삭제" : "댓글 삭제"} />
          <DialogBody>
            <p className="m-0 text-sm text-muted">
              {isReply
                ? "이 답글을 삭제하시겠습니까?"
                : "이 댓글을 삭제하시겠습니까?"}
            </p>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              취소
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => {
                deleteMutation.mutate(undefined, {
                  onSuccess: () => setIsDeleteDialogOpen(false),
                });
              }}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
