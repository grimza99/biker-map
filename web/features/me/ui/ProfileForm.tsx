"use client";
import { uploadImage } from "@/features/image";
import { useSession } from "@/features/session";
import { Button, ImageInput, Input } from "@/shared";
import { useEffect, useMemo, useState } from "react";
import { useUpdateProfile } from "../model";

export function ProfileForm() {
  const { session } = useSession();
  if (!session) return null;
  const [name, setName] = useState(session.name);
  const [avatarUrl, setAvatarUrl] = useState(session.avatarUrl);
  const [brand, setBrand] = useState(session.bikeBrand);
  const [model, setModel] = useState(session.bikeModel);
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

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

  useEffect(() => {
    setName(session.name);
    setAvatarUrl(session.avatarUrl ? session.avatarUrl : null);
    setBrand(session.bikeBrand);
    setModel(session.bikeModel);
  }, [session.avatarUrl, session.name, session.bikeBrand, session.bikeModel]);

  return (
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
        value={avatarUrl}
        maxImages={1}
        onValueChange={(urls) => setAvatarUrl(urls?.[0] ?? null)}
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
  );
}
