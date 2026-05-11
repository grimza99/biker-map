"use client";

import { Heart } from "lucide-react";

import { useSession } from "@features/session/model/use-session";
import { Button } from "@shared/ui";

import { useToggleFavorite } from "../model/use-toggle-favorite";

type FavoriteHeartButtonProps = {
  targetType: "post" | "route";
  targetId: string;
  favorited?: boolean;
  favoriteId?: string;
};

export function FavoriteHeartButton({
  targetType,
  targetId,
  favorited = false,
  favoriteId,
}: FavoriteHeartButtonProps) {
  const { status } = useSession();
  const toggleFavorite = useToggleFavorite({
    targetType,
    targetId,
  });

  const disabled = status !== "authenticated" || toggleFavorite.isPending;

  return (
    <Button
      size="icon"
      variant="secondary"
      selected={favorited}
      disabled={disabled}
      aria-label={favorited ? "즐겨찾기 해제" : "즐겨찾기 추가"}
      title={status === "authenticated" ? undefined : "로그인 후 사용할 수 있습니다."}
      onClick={() =>
        toggleFavorite.mutate({
          favorited,
          favoriteId,
        })
      }
      className={favorited ? "border-accent bg-accent/10 text-accent" : undefined}
    >
      <Heart
        className="h-4 w-4"
        fill={favorited ? "currentColor" : "none"}
        aria-hidden="true"
      />
    </Button>
  );
}
