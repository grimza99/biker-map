"use client";
import { uploadImage } from "@/features/image";
import { useSession } from "@/features/session";
import { Button, ImageInput, Input, SelectInput } from "@/shared";
import { proficiencySelectOptions } from "@package-shared/model";
import { Tproficiency } from "@package-shared/types";
import { useEffect, useMemo, useState } from "react";
import { useUpdateProfile } from "../model";

export function ProfileForm() {
  const { session } = useSession();
  const [name, setName] = useState(session?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(session?.avatarUrl ?? null);
  const [brand, setBrand] = useState(session?.bikeBrand ?? null);
  const [model, setModel] = useState(session?.bikeModel ?? null);
  const [proficiency, setProficiency] = useState<Tproficiency | null>(
    session?.proficiency ?? null
  );

  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const isDirty = useMemo(() => {
    if (!session) {
      return false;
    }

    return (
      name !== session.name ||
      avatarUrl !== session.avatarUrl ||
      session.bikeBrand !== brand ||
      model !== session.bikeModel ||
      proficiency !== session.proficiency
    );
  }, [session, avatarUrl, name, brand, model, proficiency]);

  useEffect(() => {
    if (!session) {
      return;
    }

    setName(session.name);
    setAvatarUrl(session.avatarUrl ? session.avatarUrl : null);
    setBrand(session.bikeBrand);
    setModel(session.bikeModel);
    setProficiency(session.proficiency);
  }, [session]);

  if (!session) {
    return null;
  }

  return (
    <form
      className="grid w-full gap-4"
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
          proficiency,
        });
      }}
    >
      <div className="w-full flex flex-row gap-2">
        <Input
          label="이름"
          value={name}
          onChange={(event) => setName(event.target.value.trim())}
          placeholder="라이더 이름"
          maxLength={40}
          className="flex-1"
        />
        <SelectInput
          label="숙련도"
          value={proficiency ?? ""}
          onValueChange={(option) =>
            setProficiency(option ? (option as Tproficiency) : null)
          }
          placeholder="해당 없음"
          options={proficiencySelectOptions}
          className="flex-1"
        />
      </div>
      <div className="w-full flex flex-row gap-2">
        <Input
          label="브랜드"
          value={brand || ""}
          onChange={(event) => setBrand(event.target.value.trim())}
          placeholder="브랜드명"
          maxLength={40}
          className="flex-1"
        />
        <Input
          label="모델명"
          value={model || ""}
          onChange={(event) => setModel(event.target.value.trim())}
          placeholder="모델명"
          maxLength={40}
          className="flex-1"
        />
      </div>
      <ImageInput
        label="프로필 이미지"
        value={avatarUrl}
        maxImages={1}
        previewVariant="avatar"
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
