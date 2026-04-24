export type ReactionTargetType = "post" | "comment";
export type ReactionType = "like";

export type CreateReactionBody = {
  targetType: ReactionTargetType;
  targetId: string;
  reaction: ReactionType;
};

export type CreateReactionResponseData = {
  targetType: ReactionTargetType;
  targetId: string;
  reactionCount: number;
  reacted: boolean;
};
