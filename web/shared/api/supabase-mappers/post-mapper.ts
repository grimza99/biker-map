import {
  CommunityCategorySlug,
  CommunityPost,
  CommunityPostDetail,
} from "@package-shared/types/community";
import { ReactionSummary } from "@package-shared/types/reaction";
import {
  getRecordBoolean,
  getRecordNumber,
  getRecordRelativeLabel,
  getRecordString,
  getRecordStringArray,
  SupabaseRecord,
} from "../supabase-record";

export const communityCategories = new Set<CommunityCategorySlug>([
  "notice",
  "question",
  "info",
  "free",
]);
function toCommunityCategory(value: string) {
  return communityCategories.has(value as CommunityCategorySlug)
    ? (value as CommunityCategorySlug)
    : null;
}
function toAuthorName(row: SupabaseRecord) {
  return getRecordString(
    row,
    [
      "author_name",
      "author.name",
      "profiles.name",
      "profile.name",
      "user.name",
      "author.full_name",
    ],
    "익명"
  );
}

function toAuthorId(row: SupabaseRecord) {
  return getRecordString(
    row,
    ["author_id", "authorId", "profile_id", "profileId", "user_id", "userId"],
    ""
  );
}

function toReactionSummary(row: SupabaseRecord): ReactionSummary {
  return {
    likeCount: getRecordNumber(row, ["like_count", "likeCount", "reactions.likeCount"], 0),
    dislikeCount: getRecordNumber(
      row,
      ["dislike_count", "dislikeCount", "reactions.dislikeCount"],
      0
    ),
    myReaction: (() => {
      const reaction = getRecordString(
        row,
        ["my_reaction", "myReaction", "reactions.myReaction"],
        ""
      );

      return reaction === "like" || reaction === "dislike" ? reaction : null;
    })(),
  };
}
/**
 * @description Supabase 레코드에서 커뮤니티 게시글 정보를 추출하여 CommunityPost 객체로 매핑합니다. 필수 필드(id, category, title, content)가 유효하지 않은 경우 null을 반환합니다.
 * @param row Supabase 레코드 객체
 * @returns 커뮤니티 게시글 정보를 담은 CommunityPost 객체 또는 필수 필드가 유효하지 않은 경우 null
 */
export function mapCommunityPostItem(
  row: SupabaseRecord
): CommunityPost | null {
  const id = getRecordString(row, ["id"]);
  const category = toCommunityCategory(getRecordString(row, ["category"]));
  const title = getRecordString(row, ["title"]);
  const content = getRecordString(row, ["content", "body", "excerpt"]);
  const author = toAuthorName(row);

  if (!id || !category || !title || !content) {
    return null;
  }

  return {
    id,
    category,
    title,
    excerpt: getRecordString(row, ["excerpt"], "") || content.slice(0, 80),
    author,
    timeLabel: getRecordRelativeLabel(
      row,
      ["created_at", "createdAt", "time_label", "timeLabel"],
      "방금 전"
    ),
    commentCount: getRecordNumber(row, ["comment_count", "commentCount"], 0),
    viewCount: getRecordNumber(row, ["view_count", "viewCount"], 0),
    reactions: toReactionSummary(row),
    pinned: getRecordBoolean(row, ["pinned"], false) || undefined,
    favoriteId:
      getRecordString(row, ["favorite_id", "favoriteId"], "") || undefined,
    favorited: getRecordBoolean(row, ["favorited"], false) || undefined,
  };
}

export function mapCommunityPostDetail(
  row: SupabaseRecord
): CommunityPostDetail | null {
  const item = mapCommunityPostItem(row);
  if (!item) {
    return null;
  }

  const authorId = toAuthorId(row);

  return {
    id: item.id,
    category: item.category,
    title: item.title,
    content: getRecordString(row, ["content", "body"], item.excerpt),
    author: {
      id: authorId || undefined,
      name: item.author,
    },
    timeLabel: item.timeLabel,
    commentCount: item.commentCount,
    viewCount: item.viewCount,
    reactions: item.reactions,
    pinned: item.pinned,
    images: getRecordStringArray(row, ["images"]),
    favoriteId: item.favoriteId,
    favorited: item.favorited,
  };
}
