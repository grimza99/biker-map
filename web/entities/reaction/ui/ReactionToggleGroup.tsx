"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import type { ReactNode } from "react";

import { useToggleReaction } from "@features/reaction/model/use-toggle-reaction";
import type {
  ReactionToggleGroupProps,
  ReactionType,
} from "@package-shared/index";
import { Button } from "@shared/ui";

type ReactionButtonProps = {
  icon: ReactNode;
  label: string;
  count: number;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
};

function ReactionButton({
  icon,
  label,
  count,
  selected,
  onClick,
  disabled,
}: ReactionButtonProps) {
  return (
    <Button
      size="sm"
      variant="ghost"
      selected={selected}
      disabled={disabled}
      className="h-8 gap-1.5 px-2.5 text-xs text-muted"
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
      <span>{count}</span>
    </Button>
  );
}

export function ReactionToggleGroup({
  targetType,
  targetId,
  reactions,
  postId,
  disabled,
}: ReactionToggleGroupProps) {
  const toggleReaction = useToggleReaction({
    targetType,
    targetId,
    postId,
  });

  const handleToggle = (reaction: ReactionType) => {
    void toggleReaction.mutateAsync(reaction);
  };

  return (
    <div className="flex items-center gap-2">
      <ReactionButton
        icon={<ThumbsUp className="h-4 w-4" />}
        label="좋아요"
        count={reactions.likeCount}
        selected={reactions.myReaction === "like"}
        disabled={disabled || toggleReaction.isPending}
        onClick={() => handleToggle("like")}
      />
      <ReactionButton
        icon={<ThumbsDown className="h-4 w-4" />}
        label="싫어요"
        count={reactions.dislikeCount}
        selected={reactions.myReaction === "dislike"}
        disabled={disabled || toggleReaction.isPending}
        onClick={() => handleToggle("dislike")}
      />
    </div>
  );
}
