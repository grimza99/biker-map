import { DefaultCardContainer, MetaCounts, Profile } from "@/shared";
import { CommunityComment, CommunityReply } from "@package-shared/index";
import { ReplyIcon } from "lucide-react";

export interface CommentCardProps {
  content: CommunityComment | CommunityReply;
  onClickShowReplyForm?: () => void;
}
export function CommentCard({
  content,
  onClickShowReplyForm,
}: CommentCardProps) {
  const isReply = "parentCommentId" in content;

  return (
    <DefaultCardContainer
      className="p-3 gap-2"
      footer={
        !isReply && (
          <div className="flex items-center gap-4">
            <div
              onClick={onClickShowReplyForm}
              className="flex items-center gap-1 cursor-pointer"
            >
              <ReplyIcon className="h-4 w-4 text-primary" />
              <button className="text-sm text-primary">답글 달기</button>
            </div>

            <MetaCounts commentCount={content.replyCount} />
          </div>
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
