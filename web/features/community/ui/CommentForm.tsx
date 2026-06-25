import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@/shared";
import { ApiClientError } from "@package-shared/index";
import { useForm } from "react-hook-form";
import {
  commentFormSchema,
  type CommentFormValues,
} from "../model/community-form-schemas";
import { useCreatePostComment } from "../model/use-comments";
import { useCreateCommentReply } from "../model/use-reply";

interface CommentFormProps {
  postId: string;
  disabled?: boolean;
  placeholder?: string;
  submitType?: "comment" | "reply";
  commentId?: string;
}

export default function CommentForm({
  postId,
  disabled,
  placeholder,
  submitType = "comment",
  commentId,
}: CommentFormProps) {
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    mode: "onChange",
    defaultValues: {
      content: "",
    },
  });
  const createCommentMutation = useCreatePostComment(postId);
  const createReplyMutation = useCreateCommentReply(postId, commentId ?? "");
  const submitMutation =
    submitType === "reply" ? createReplyMutation : createCommentMutation;

  const handleSubmit = form.handleSubmit((values) => {
    const mutate =
      submitType === "comment" ? createCommentMutation : createReplyMutation;

    mutate.mutate(values.content, {
      onSuccess: () => {
        form.reset();
      },
    });
  });

  return (
    <form
      className="flex gap-3 justify-end"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
      noValidate
    >
      <Input
        placeholder={placeholder ?? "댓글을 입력하세요"}
        className="flex-1"
        errorText={form.formState.errors.content?.message}
        disabled={submitMutation.isPending || disabled}
        {...form.register("content")}
      />
      <Button
        type="submit"
        size="sm"
        loading={submitMutation.isPending}
        disabled={
          !form.formState.isValid || submitMutation.isPending || disabled
        }
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
