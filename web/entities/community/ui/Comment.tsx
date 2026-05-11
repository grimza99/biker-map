import { useSession } from "@/features";
import CommentForm from "@/features/community/ui/CommentForm";
import { CommunityComment } from "@package-shared/index";
import { useState } from "react";
import { CommentCard } from "./CommentCard";

interface CommentProps {
  postId: string;
  comment: CommunityComment;
}
export default function Comment({ postId, comment }: CommentProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { status } = useSession();

  return (
    <div key={comment.id} className="flex flex-col gap-2">
      <CommentCard
        postId={postId}
        content={comment}
        disabled={status !== "authenticated"}
        onClickShowReplyForm={() => setShowReplyForm((p) => !p)}
      />
      {showReplyForm && (
        <CommentForm
          postId={postId}
          disabled={status !== "authenticated"}
          placeholder="답글을 입력하세요"
          submitType="reply"
          commentId={comment.id}
        />
      )}
      {comment.replies.length > 0 && (
        <div className="grid gap-2 border-l border-border pl-4 m-4">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              postId={postId}
              content={reply}
              disabled={status !== "authenticated"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
