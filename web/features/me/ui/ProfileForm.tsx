"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { proficiencySelectOptions } from "@package-shared/model";
import type { Tproficiency } from "@package-shared/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { uploadImage } from "@/features/image";
import { useSession } from "@/features/session";
import { Button, ImageInput, Input, SelectInput } from "@/shared";
import {
  ProfileFormInput,
  profileFormSchema,
  ProfileFormValues,
} from "@package-shared/schemas";
import { useUpdateProfile } from "../model";

export function ProfileForm() {
  const { session } = useSession();
  const sessionName = session?.name ?? "";
  const sessionAvatarUrl = session?.avatarUrl ?? null;
  const sessionBikeBrand = session?.bikeBrand ?? "";
  const sessionBikeModel = session?.bikeModel ?? "";
  const sessionProficiency: ProfileFormInput["proficiency"] =
    session?.proficiency ?? "";
  const defaultValues = useMemo(
    () => ({
      name: sessionName,
      avatarUrl: sessionAvatarUrl,
      bikeBrand: sessionBikeBrand,
      bikeModel: sessionBikeModel,
      proficiency: sessionProficiency ?? "",
    }),
    [
      sessionAvatarUrl,
      sessionBikeBrand,
      sessionBikeModel,
      sessionName,
      sessionProficiency,
    ]
  );
  const resetKey = useMemo(
    () => JSON.stringify(defaultValues),
    [defaultValues]
  );
  const [isImageUploading, setIsImageUploading] = useState(false);
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();
  const form = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues,
  });
  const lastResetKeyRef = useRef(resetKey);

  useEffect(() => {
    if (lastResetKeyRef.current === resetKey) {
      return;
    }

    lastResetKeyRef.current = resetKey;
    form.reset(defaultValues);
  }, [defaultValues, form, resetKey]);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (isPending || isImageUploading) {
      return;
    }

    await updateProfile(values);
  });

  if (!session) {
    return null;
  }

  return (
    <form
      className="grid w-full gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
      noValidate
    >
      <div className="w-full flex flex-row gap-2">
        <Input
          label="이름"
          placeholder="라이더 이름"
          className="flex-1"
          errorText={form.formState.errors.name?.message}
          {...form.register("name")}
        />
        <Controller
          control={form.control}
          name="proficiency"
          render={({ field, fieldState }) => (
            <SelectInput
              label="숙련도"
              value={field.value}
              onValueChange={(option) =>
                field.onChange(option as Tproficiency | "")
              }
              placeholder="해당 없음"
              options={proficiencySelectOptions}
              className="flex-1"
              errorText={fieldState.error?.message}
            />
          )}
        />
      </div>
      <div className="w-full flex flex-row gap-2">
        <Input
          label="브랜드"
          placeholder="브랜드명"
          className="flex-1"
          errorText={form.formState.errors.bikeBrand?.message}
          {...form.register("bikeBrand")}
        />
        <Input
          label="모델명"
          placeholder="모델명"
          className="flex-1"
          errorText={form.formState.errors.bikeModel?.message}
          {...form.register("bikeModel")}
        />
      </div>

      <Controller
        control={form.control}
        name="avatarUrl"
        render={({ field, fieldState }) => (
          <ImageInput
            label="프로필 이미지"
            value={field.value}
            maxImages={1}
            previewVariant="avatar"
            onValueChange={(urls) => {
              field.onChange(urls?.[0] ?? null);
              void form.trigger("avatarUrl");
            }}
            onUploadingChange={setIsImageUploading}
            onUpload={async (file) => {
              const uploaded = await uploadImage(file);
              return uploaded.url;
            }}
            disabled={form.formState.isSubmitting || isPending}
            errorText={fieldState.error?.message}
          />
        )}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          loading={isPending || form.formState.isSubmitting || isImageUploading}
          disabled={!form.formState.isDirty || isPending || isImageUploading}
        >
          저장
        </Button>
      </div>
    </form>
  );
}
