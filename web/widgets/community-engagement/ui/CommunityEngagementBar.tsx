"use client";

import type { ReactNode } from "react";

import { ReactionToggleGroup } from "@/entities/reaction";
import type {
  ReactionSummary,
  ReactionTargetType,
} from "@package-shared/index";
import { cn } from "@shared/lib";

type CommunityEngagementBarProps = {
  targetType: ReactionTargetType;
  targetId: string;
  reactions: ReactionSummary;
  postId?: string;
  disabled?: boolean;
  leadingSlot?: ReactNode;
  trailingSlot?: ReactNode;
  className?: string;
};

export function CommunityEngagementBar({
  targetType,
  targetId,
  reactions,
  postId,
  disabled,
  leadingSlot,
  trailingSlot,
  className,
}: CommunityEngagementBarProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex items-center gap-3">{leadingSlot}</div>
      <div className="flex items-center gap-3">
        {trailingSlot}
        <ReactionToggleGroup
          targetType={targetType}
          targetId={targetId}
          reactions={reactions}
          postId={postId}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
