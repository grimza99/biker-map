import { DefaultCardContainer, Profile } from "@/shared";
import { CommunityEngagementBar } from "@/widgets";
import { CommunityComment, CommunityReply } from "@package-shared/index";
import { MessageSquare, ReplyIcon } from "lucide-react";
import { Button } from "@shared/ui";

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

  return (
    <DefaultCardContainer
      className="p-3 gap-2"
      footer={
        (
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
        )
      }
    >
      <div className="flex items-center justify-between gap-3">
        <Profile
          name={content.author.name}
          className="w-auto gap-2 p-0 border-none bg-transparent"
          imgClassName="h-7 w-7"
        />
        <span className="text-xs text-muted">{content.timeLabel}</span>
      </div>
      <p className="m-0 whitespace-pre-wrap text-sm leading-7 text-text/92">
        {content.content}
      </p>
    </DefaultCardContainer>
  );
}
