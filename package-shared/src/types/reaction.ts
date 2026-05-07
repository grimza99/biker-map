export type ReactionTargetType = "post" | "comment";
export type ReactionType = "like" | "dislike";

export type ReactionSummary = {
  likeCount: number;
  dislikeCount: number;
  myReaction: ReactionType | null;
};

export type CreateReactionBody = {
  targetType: ReactionTargetType;
  targetId: string;
  reaction: ReactionType;
};

export type CreateReactionResponseData = {
  targetType: ReactionTargetType;
  targetId: string;
  likeCount: number;
  dislikeCount: number;
  myReaction: ReactionType | null;
};
