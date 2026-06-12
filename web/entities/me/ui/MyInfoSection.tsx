"use client";
import AuthVerifyDialog from "@/features/auth/ui/AuthVerifyDialog";
import { uploadImage } from "@/features/image";
import { useUpdateProfile } from "@/features/me";
import {
  Button,
  Chip,
  cn,
  DefaultCardContainer,
  ImageInput,
  Input,
  ProfileImgChip,
} from "@/shared";
import { AppSession } from "@package-shared/index";
import { ShieldHalfIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function MyInfoSection({ session }: { session: AppSession }) {
  const [name, setName] = useState(session.name);
  const [brand, setBrand] = useState(session.bikeBrand);
  const [model, setModel] = useState(session.bikeModel);
  const [avatarUrls, setAvatarUrls] = useState<string[] | null>(
    session.avatarUrl ? [session.avatarUrl] : null
  );
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);

  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  useEffect(() => {
    setName(session.name);
    setAvatarUrls(session.avatarUrl ? [session.avatarUrl] : null);
    setBrand(session.bikeBrand);
    setModel(session.bikeModel);
  }, [session.avatarUrl, session.name, session.bikeBrand, session.bikeModel]);

  const avatarUrl = avatarUrls?.[0] ?? null;
  const isDirty = useMemo(
    () =>
      name !== session.name ||
      avatarUrl !== session.avatarUrl ||
      session.bikeBrand !== brand ||
      model !== session.bikeModel,
    [
      avatarUrl,
      name,
      session.avatarUrl,
      session.name,
      brand,
      model,
      session.bikeBrand,
      session.bikeModel,
    ]
  );
  const verifiedLabel = session.isVerified
    ? "본인 인증 완료"
    : "본인 인증 미완료";
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
                {session.name}
              </h1>
              <p className="m-0 text-sm text-muted">{session.email}</p>
              <div className="flex gap-2">
                <span>{session.bikeBrand}</span>
                <strong>·</strong>
                <span> {session.bikeModel}</span>
              </div>
              <button
                className="w-fit h-fit"
                disabled={!!session.isVerified}
                onClick={() => {
                  setIsVerifyDialogOpen(true);
                }}
              >
                <Chip
                  icon={<ShieldHalfIcon className="size-4" />}
                  label={verifiedLabel}
                  className={cn(
                    session.isVerified &&
                      "bg-green-300/10 border-green-300/20 text-green-300"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
        <form
          className="grid w-full max-w-105 gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (isPending || !isDirty || !name.trim()) {
              return;
            }

            updateProfile({
              name: name,
              avatarUrl,
              bikeBrand: brand || null,
              bikeModel: model || null,
            });
          }}
        >
          <Input
            label="이름"
            value={name}
            onChange={(event) => setName(event.target.value.trim())}
            placeholder="라이더 이름"
            maxLength={40}
          />
          <div className="flex flex-row gap-2">
            <Input
              label="브랜드"
              value={brand || ""}
              onChange={(event) => setBrand(event.target.value.trim())}
              placeholder="브랜드명"
              maxLength={40}
            />
            <Input
              label="모델명"
              value={model || ""}
              onChange={(event) => setModel(event.target.value.trim())}
              placeholder="모델명"
              maxLength={40}
            />
          </div>
          <ImageInput
            label="프로필 이미지"
            value={avatarUrls}
            maxImages={1}
            onValueChange={(urls) => setAvatarUrls(urls)}
            onUpload={async (file) => {
              const uploaded = await uploadImage(file);
              return uploaded.url;
            }}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              loading={isPending}
              disabled={!isDirty || !name.trim() || isPending}
            >
              저장
            </Button>
          </div>
        </form>
        <AuthVerifyDialog
          open={isVerifyDialogOpen}
          onOpenChange={() => setIsVerifyDialogOpen(false)}
        />
      </div>
    </DefaultCardContainer>
  );
}
