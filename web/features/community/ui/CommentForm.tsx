import { ApiClientError, Button, Input } from "@/shared";
import { SubmitEvent, useState } from "react";
import { useCreatePostComment } from "../model/use-comments";
import { useCreateCommentReply } from "../model/use-reply";

interface CommentFormProps {
  postId: string;
  disabled?: boolean;
  placeholder?: string;
  submitType?: "comment" | "reply";
  commentId?: string; // reply인 경우에 필요
}
export default function CommentForm({
  postId,
  disabled,
  placeholder,
  submitType = "comment",
  commentId,
}: CommentFormProps) {
  const [comment, setComment] = useState("");
  const createCommentMutation = useCreatePostComment(postId);
  const createReplyMutation = useCreateCommentReply(postId, commentId ?? "");
  const submitMutation =
    submitType === "reply" ? createReplyMutation : createCommentMutation;
  placeholder = placeholder ?? "댓글을 입력하세요";

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!comment.trim()) return;
    if (submitType === "comment") {
      createCommentMutation.mutate(comment.trim(), {
        onSuccess: () => setComment(""),
      });
    } else {
      createReplyMutation.mutate(comment.trim(), {
        onSuccess: () => setComment(""),
      });
    }
  };

  return (
    <form className="flex gap-3 justify-end" onSubmit={handleSubmit}>
      <Input
        placeholder={placeholder}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        className="flex-1"
        disabled={submitMutation.isPending || disabled}
      />
      <Button
        type="submit"
        size="sm"
        loading={submitMutation.isPending}
        disabled={!comment.trim()}
      >
        댓글 등록
      </Button>
      {submitMutation.error instanceof ApiClientError ? (
        <p className="m-0 text-sm text-danger">
          {submitMutation.error.message}
        </p>
      ) : null}
    </form>
  );
}
