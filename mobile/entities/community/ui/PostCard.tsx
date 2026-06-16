import { type Href, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { type CommunityPost, CHIP_COLOR } from "@package-shared/index";

import {
  AppText,
  Chip,
  DefaultCardContainer,
  MetaCounts,
} from "@/components/common";

type PostCardProps = {
  post: CommunityPost;
  categoryLabel: string;
};

export function PostCard({ post, categoryLabel }: PostCardProps) {
  const router = useRouter();
  const chipColor = CHIP_COLOR[post.category];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/(tabs)/community/${post.id}` as Href)}
    >
      <DefaultCardContainer>
        <View className="flex flex-col items-start gap-2">
          <View className="w-full flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-2">
              <Chip label={categoryLabel} className={chipColor} />
              {post.pinned && <Chip label="고정" />}
              <AppText className="m-0 max-w-20 truncate text-xl font-semibold tracking-(--tracking-heading-md)">
                {post.title}
              </AppText>
            </View>
            <AppText tone="muted" className="text-xs">
              {post.timeLabel}
            </AppText>
          </View>

          <AppText
            tone="muted"
            className="ml-2 text-sm leading-7"
            numberOfLines={2}
          >
            {post.excerpt}
          </AppText>

          <View className="flex-row items-center justify-between gap-3">
            <AppText
              tone="subtle"
              className="flex-1 truncate text-sm font-medium"
            >
              {post.author}
            </AppText>
            <MetaCounts
              commentCount={post.commentCount}
              viewCount={post.viewCount}
            />
          </View>
        </View>
      </DefaultCardContainer>
    </Pressable>
  );
}
