"use client";
import { AuthVerifyDialog } from "@/features/auth";
import { ProfileForm } from "@/features/me";
import { Chip, cn, DefaultCardContainer, ProfileImgChip } from "@/shared";
import {
  AppSession,
  proficiencyClassNameMap,
  proficiencyMap,
} from "@package-shared/index";
import { ShieldHalfIcon } from "lucide-react";
import { useState } from "react";

export function MyInfoSection({ session }: { session: AppSession }) {
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);

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
  const proficiencyLabel = proficiency
    ? proficiencyMap[proficiency]
    : "정보 없음";

  return (
    <DefaultCardContainer>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="grid gap-4">
          <p className="m-0 text-md font-semibold uppercase tracking-[0.08em] text-accent">
            내 정보
          </p>
          <div className="flex items-center gap-4">
            <ProfileImgChip
              name={name}
              avatarUrl={avatarUrl ?? undefined}
              className="h-16 w-16 text-2xl"
            />
            <div className="grid gap-1">
              <h1 className="m-0 text-[clamp(28px,4vw,42px)] font-semibold tracking-[-0.04em] text-text">
                {name}
              </h1>
              <p className="m-0 text-sm text-muted">{email}</p>
              <div className="flex gap-2">
                <span>{bikeBrand}</span>
                <strong>·</strong>
                <span> {bikeModel}</span>
              </div>
              <div className="flex flex-row gap-3">
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
                <Chip
                  label={proficiencyLabel}
                  className={proficiencyClassNameMap(proficiency)}
                />
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
