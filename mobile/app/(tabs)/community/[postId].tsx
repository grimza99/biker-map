import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Alert, Image, Pressable, View } from "react-native";
import { useState } from "react";

import {
  CHIP_COLOR,
  bikerMapTheme,
  categoryLabelMap,
} from "@package-shared/index";

import {
  CommentThread,
  usePostComments,
  usePostDetail,
} from "@/entities/community";
import {
  AppText,
  Button,
  Chip,
  DefaultCardContainer,
  Input,
  MetaCounts,
} from "@/components/common";
import { AppScreen } from "@/components/shell";
import { useSession } from "@/features/session/model";
import {
  formatRelative,
  Indicator,
  openExternalUrl,
  ScreenState,
} from "@/shared";
import { FavoriteActionButton, useToggleFavorite } from "@/features/favorite";
import { useCreatePostComment } from "@/features/community";

import { DetailContentSkeleton } from "@/widgets/ui";

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { status } = useSession();

  const [comment, setComment] = useState("");
  const {
    data: postResponse,
    isLoading,
    refetch,
    isError,
  } = usePostDetail(postId ?? "");
  const {
    data: commentsResponse,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    isPending: isCommentsPending,
  } = usePostComments(postId ?? "");

  const { mutateAsync: toggleFavorite } = useToggleFavorite({
    targetType: "post",
    targetId: postId,
  });

  const { mutateAsync: createComment, isPending: isCreateCommentPending } =
    useCreatePostComment(postId ?? "");

  const post = postResponse?.data;
  const comments = commentsResponse?.data.items ?? [];
  const isAuthenticated = status === "authenticated";
  const chipColor = post ? CHIP_COLOR[post.category] : "";

  async function handleCreateComment() {
    try {
      await createComment(comment);
      setComment("");
    } catch (error) {
      Alert.alert(
        "댓글 작성 실패",
        error instanceof Error ? error.message : "오류가 발생했습니다."
      );
    }
  }

  return (
    <AppScreen containerStyle={{ padding: 0 }}>
      {isLoading ? (
        <DetailContentSkeleton />
      ) : isError || !post ? (
        <ScreenState
          title="게시글을 불러오지 못했습니다."
          description="게시글을 불러오지 못했습니다."
          variant="error"
          refetch={refetch}
        />
      ) : (
        <>
          <View className="bg-panel px-2 py-4">
            <View className="gap-4">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1 flex-row flex-wrap items-center gap-2">
                  <Chip
                    label={categoryLabelMap[post.category]}
                    className={chipColor}
                  />
                  {post.pinned && <Chip label="고정" />}
                </View>

                <AppText tone="muted" className="text-xs font-semibold">
                  {formatRelative(post.timeLabel)}
                </AppText>
              </View>

              <AppText className="text-[28px] font-extrabold leading-9">
                {post.title}
              </AppText>
              <View className="flex flex-row justify-between items-center">
                <View className="gap-2">
                  <AppText tone="subtle" className="font-semibold">
                    {post.author.name}
                  </AppText>
                  <MetaCounts
                    commentCount={post.commentCount}
                    viewCount={post.viewCount}
                  />
                </View>
                <FavoriteActionButton
                  selected={post.favorited}
                  disabled={!isAuthenticated}
                  onClick={() =>
                    toggleFavorite({
                      favorited: post.favorited,
                      favoriteId: post.favoriteId,
                    })
                  }
                />
              </View>
            </View>
          </View>

          <View className="bg-bg">
            <AppText className="leading-7">{post.content}</AppText>
          </View>

          {post.images?.length ? (
            <DefaultCardContainer containerStyle="rounded-3xl bg-panel">
              <View className="gap-3">
                {post.images.map((image) => (
                  <Pressable
                    key={image}
                    accessibilityRole="imagebutton"
                    accessibilityLabel={`${post.title} 이미지 열기`}
                    className="overflow-hidden rounded-2xl border border-border bg-panel-soft"
                    onPress={() => void openExternalUrl(image)}
                  >
                    <View className="aspect-4/3 w-full">
                      <Image
                        source={{ uri: image }}
                        accessibilityLabel={`${post.title} 이미지`}
                        className="h-full w-full"
                        resizeMode="contain"
                      />
                    </View>
                  </Pressable>
                ))}
              </View>
            </DefaultCardContainer>
          ) : null}

          {/* 댓글 인풋 */}
          <View className="flex flex-row gap-2 items-center bg-panel-soft w-full py-3 px-4">
            <Input
              value={comment}
              placeholder="댓글을 입력하세요"
              disabled={isCommentsPending || !isAuthenticated}
              className="flex-1"
              onChange={(e) => setComment(e.nativeEvent.text)}
              editable={!isCreateCommentPending}
            />
            <Button
              size="sm"
              style={{
                borderRadius: 16,
                backgroundColor: bikerMapTheme.colors.accent,
                paddingHorizontal: 2,
              }}
              onPress={handleCreateComment}
              disabled={isCreateCommentPending || !isAuthenticated}
            >
              <Feather name="send" size={24} color="white" />
            </Button>
          </View>
          <View className="gap-3">
            {isCommentsLoading ? (
              <Indicator />
            ) : isCommentsError ? (
              <ScreenState
                title=""
                variant="error"
                description=" 댓글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요"
              />
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  postId={post.id}
                  canReply={isAuthenticated}
                />
              ))
            ) : (
              <ScreenState
                title=""
                variant="not-found"
                description="아직 등록된 댓글이 없습니다. 첫 댓글을 남겨보세요!"
              />
            )}
          </View>
        </>
      )}
    </AppScreen>
  );
}
