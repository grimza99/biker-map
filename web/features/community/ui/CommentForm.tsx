import { ApiClientError, Button, Input } from "@/shared";
import { SubmitEvent, useState } from "react";
import { useCreatePostComment } from "../model/use-community-post-detail";

interface CommentFormProps {
  postId: string;
  disabled?: boolean;
  placeholder?: string;
}
export default function CommentForm({
  postId,
  disabled,
  placeholder,
}: CommentFormProps) {
  const [comment, setComment] = useState("");
  const createCommentMutation = useCreatePostComment(postId);

  placeholder = placeholder ?? "댓글을 입력하세요";

  const handleSubmitComment = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!comment.trim()) return;
    createCommentMutation.mutate(comment.trim(), {
      onSuccess: () => setComment(""),
    });
  };

  return (
    <form className="flex gap-3 justify-end" onSubmit={handleSubmitComment}>
      <Input
        placeholder={placeholder}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        className="flex-1"
        disabled={createCommentMutation.isPending || disabled}
      />
      <Button
        type="submit"
        size="sm"
        loading={createCommentMutation.isPending}
        disabled={!comment.trim()}
      >
        댓글 등록
      </Button>
      {createCommentMutation.error instanceof ApiClientError ? (
        <p className="m-0 text-sm text-danger">
          {createCommentMutation.error.message}
        </p>
      ) : null}
    </form>
  );
}
