"use client";

import { uploadImage } from "@/features/image";
import {
  Button,
  DefaultCardContainer,
  ImageInput,
  Input,
  ProfileImgChip,
} from "@/shared";
import { useUpdateProfile } from "@features/me/model/use-update-profile";
import { AppSession } from "@package-shared/index";
import { useEffect, useMemo, useState } from "react";

export function MyInfoSection({ session }: { session: AppSession }) {
  const [name, setName] = useState(session.name);
  const [avatarUrls, setAvatarUrls] = useState<string[] | null>(
    session.avatarUrl ? [session.avatarUrl] : null
  );
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  useEffect(() => {
    setName(session.name);
    setAvatarUrls(session.avatarUrl ? [session.avatarUrl] : null);
  }, [session.avatarUrl, session.name]);

  const avatarUrl = avatarUrls?.[0] ?? null;
  const isDirty = useMemo(
    () => name.trim() !== session.name || avatarUrl !== session.avatarUrl,
    [avatarUrl, name, session.avatarUrl, session.name]
  );

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
              <p className="m-0 text-sm text-muted">{session.email}</p>
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
              name: name.trim(),
              avatarUrl,
            });
          }}
        >
          <Input
            label="이름"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="라이더 이름"
            maxLength={40}
          />
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
              프로필 저장
            </Button>
          </div>
        </form>
      </div>
    </DefaultCardContainer>
  );
}
