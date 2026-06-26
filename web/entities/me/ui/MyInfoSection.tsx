"use client";
import { AuthVerifyDialog } from "@/features/auth";
import { ProfileForm } from "@/features/me";
import { useMyPosts } from "@/features/me/model/use-my-posts";
import { Chip, cn, DefaultCardContainer, ProfileImgChip } from "@/shared";
import {
  AppSession,
  proficiencyClassNameMap,
  proficiencyMap,
} from "@package-shared/index";
import { ShieldHalfIcon } from "lucide-react";
import { useState } from "react";
import { useMyFavorites } from "../model";
import { useReceivedFavoriteCount } from "../model/use-my-favorites-query";

export function MyInfoSection({ session }: { session: AppSession }) {
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const { data: favoritePosts } = useMyFavorites(
    { page: 0, pageSize: 0 },
    "post"
  );
  const { data: favoriteRoutes } = useMyFavorites(
    { page: 0, pageSize: 0 },
    "route"
  );
  const { data: myPosts } = useMyPosts({
    page: 1,
    pageSize: 1,
  });
  const { data: receivedFavorites } = useReceivedFavoriteCount();

  const myFavoriteCount =
    (favoritePosts?.meta?.total ?? 0) + (favoriteRoutes?.meta?.total ?? 0);
  if (!session) return null;

  const {
    name,
    avatarUrl,
    email,
    bikeBrand,
    bikeModel,
    isVerified,
    proficiency,
  } = session;

  const verifiedLabel = isVerified ? "본인 인증 완료" : "본인 인증 미완료";

  return (
    <DefaultCardContainer>
      <div className="flex flex-col items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <ProfileImgChip
            name={name}
            avatarUrl={avatarUrl ?? undefined}
            className="h-20 w-20 text-2xl"
          />
          <div className="grid gap-1">
            <div className="flex flex-row gap-3 items-end">
              <h1 className="m-0 text-[clamp(28px,4vw,36px)] font-semibold tracking-[-0.04em] text-text">
                {name}
              </h1>
              <button
                className="w-fit h-fit"
                disabled={!!isVerified}
                onClick={() => {
                  setIsVerifyDialogOpen(true);
                }}
              >
                <Chip
                  icon={<ShieldHalfIcon className="size-4" />}
                  label={verifiedLabel}
                  className={cn(
                    isVerified &&
                      "bg-green-300/10 border-green-300/20 text-green-300"
                  )}
                />
              </button>
              {proficiency && (
                <Chip
                  label={proficiencyMap[proficiency]}
                  className={proficiencyClassNameMap(proficiency)}
                />
              )}
            </div>
            <p className="m-0 text-sm text-muted">{email}</p>
            {bikeBrand && bikeModel && (
              <div className="flex gap-2">
                <span>{bikeBrand}</span>
                <strong>·</strong>
                <span> {bikeModel}</span>
              </div>
            )}
            <div className="flex flex-row gap-3">
              <div className="flex flex-col gap-2 items-center">
                <span className="text-muted">게시글</span>
                <strong className="text-xl">{myPosts?.meta?.total}</strong>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <span className="text-muted">즐겨찾기</span>

                <strong className="text-xl">{myFavoriteCount}</strong>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <span className="text-muted">받은 좋아요</span>
                <strong className="text-xl">
                  {receivedFavorites?.data.totalFavoriteCount}
                </strong>
              </div>
            </div>
          </div>
        </div>
        <ProfileForm />
        <AuthVerifyDialog
          open={isVerifyDialogOpen}
          onOpenChange={() => setIsVerifyDialogOpen(false)}
        />
      </div>
    </DefaultCardContainer>
  );
}
