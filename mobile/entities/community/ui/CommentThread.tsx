import { useState } from "react";
import { Alert, View } from "react-native";
import {
  bikerMapTheme,
  type CommunityComment,
  type CommunityReply,
} from "@package-shared/index";

import { CommentCard } from "./CommentCard";
import { Button, Input } from "@/components/common";
import { Feather } from "@expo/vector-icons";
import { useSession } from "@/features/session/model";
import {
  useCreateCommentReply,
  useDeleteComment,
  useDeleteCommentReply,
  useToggleReaction,
  useUpdateComment,
  useUpdateCommentReply,
} from "@/features/community";

type CommentThreadProps = {
  comment: CommunityComment;
  postId: string;
  canReply: boolean;
};

export function CommentThread({
  comment,
  postId,
  canReply,
}: CommentThreadProps) {
  const [reply, setReply] = useState("");
  const [replyInputOpen, setReplyInputOpen] = useState(false);

  const { status, user } = useSession();

  const { mutateAsync: createReply, isPending: isCreateReplyPending } =
    useCreateCommentReply(postId, comment.id);
  const { mutateAsync: updateComment, isPending: isUpdateCommentPending } =
    useUpdateComment(postId, comment.id);
  const { mutateAsync: deleteComment, isPending: isDeleteCommentPending } =
    useDeleteComment(postId, comment.id);
  const { mutateAsync: CommentReaction } = useToggleReaction({
    targetType: "comment",
    postId: postId,
    targetId: comment.id,
  });
  const isLoggedin = status === "authenticated";
  const canManageComment =
    isLoggedin &&
    (user?.userId === comment.author.id || user?.role === "admin");
  const isCommentMutating = isUpdateCommentPending || isDeleteCommentPending;

  async function handleReplySubmit() {
    try {
      await createReply(reply);
      setReply("");
      setReplyInputOpen(false);
    } catch (error) {
      Alert.alert(
        "답글 작성 실패",
        error instanceof Error ? error.message : "오류가 발생했습니다."
      );
    }
  }

  return (
    <View className="gap-2.5 px-4">
      <CommentCard
        canManage={canManageComment}
        isMutating={isCommentMutating}
        item={comment}
        disabled={!canReply}
        onDelete={() => deleteComment()}
        showReplyAction
        onUpdate={(content) => updateComment({ content })}
        onReplyPress={() => setReplyInputOpen((prev) => !prev)}
        onReaction={(reaction) => CommentReaction(reaction)}
      />

      {replyInputOpen && canReply && (
        <View className="pl-4 flex flex-row items-start gap-2">
          <Input
            placeholder={
              isLoggedin ? "답글을 입력하세요" : "로그인후 답글 입력 가능"
            }
            disabled={isCreateReplyPending}
            value={reply}
            onChange={(e) => setReply(e.nativeEvent.text)}
            className="flex-1"
          />
          <Button
            size="sm"
            style={{
              borderRadius: 16,
              backgroundColor: bikerMapTheme.colors.accent,
              paddingHorizontal: 1,
            }}
            onPress={handleReplySubmit}
          >
            <Feather name="send" size={16} color="white" />
          </Button>
        </View>
      )}
      {/* reply list 영역 */}
      {comment.replies.length > 0 && (
        <View className="gap-2.5 pl-4">
          {comment.replies.map((reply) => (
            <ReplyCard
              key={reply.id}
              canReply={canReply}
              postId={postId}
              reply={reply}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function ReplyCard({
  canReply,
  postId,
  reply,
}: {
  canReply: boolean;
  postId: string;
  reply: CommunityReply;
}) {
  const { status, user } = useSession();
  const { mutateAsync: toggleReplyReaction } = useToggleReaction({
    targetType: "comment",
    postId,
    targetId: reply.id,
  });
  const { mutateAsync: updateReply, isPending: isUpdateReplyPending } =
    useUpdateCommentReply(postId, reply.id);
  const { mutateAsync: deleteReply, isPending: isDeleteReplyPending } =
    useDeleteCommentReply(postId, reply.id);
  const canManageReply =
    status === "authenticated" &&
    (user?.userId === reply.author.id || user?.role === "admin");
  const isReplyMutating = isUpdateReplyPending || isDeleteReplyPending;

  return (
    <CommentCard
      canManage={canManageReply}
      isMutating={isReplyMutating}
      item={reply}
      disabled={!canReply}
      onDelete={() => deleteReply()}
      onReaction={(reaction) => toggleReplyReaction(reaction)}
      onUpdate={(content) => updateReply({ content })}
    />
  );
}
