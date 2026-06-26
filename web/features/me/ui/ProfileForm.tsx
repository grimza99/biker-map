"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { uploadImage } from "@/features/image";
import { useSession } from "@/features/session";
import { Button, ImageInput, Input, SelectInput } from "@/shared";
import { proficiencySelectOptions } from "@package-shared/model";
import { Tproficiency } from "@package-shared/types";
import { useUpdateProfile } from "../model";
import {
  createProfileFormDefaultValues,
  type ProfileFormInput,
  profileFormSchema,
  type ProfileFormValues,
} from "../model/profile-form-schemas";

export function ProfileForm() {
  const { session } = useSession();
  const form = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: createProfileFormDefaultValues(session),
  });
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  useEffect(() => {
    form.reset(createProfileFormDefaultValues(session));
  }, [form, session]);

  if (!session) {
    return null;
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    await updateProfile(values);
  });

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
          maxLength={40}
          errorText={form.formState.errors.name?.message}
          {...form.register("name")}
        />
        <Controller
          control={form.control}
          name="proficiency"
          render={({ field, fieldState }) => (
            <SelectInput
              label="숙련도"
              value={field.value ?? ""}
              className="flex-1"
              onValueChange={(option) =>
                field.onChange(option ? (option as Tproficiency) : null)
              }
              placeholder="해당 없음"
              options={proficiencySelectOptions}
              errorText={fieldState.error?.message}
            />
          )}
        />
      </div>
      <div className="w-full flex flex-row gap-2">
        <Input
          label="브랜드"
          placeholder="브랜드명"
          maxLength={40}
          className="flex-1"
          errorText={form.formState.errors.bikeBrand?.message}
          {...form.register("bikeBrand")}
        />
        <Input
          label="모델명"
          placeholder="모델명"
          maxLength={40}
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
            onValueChange={(urls) => field.onChange(urls?.[0] ?? null)}
            onUpload={async (file) => {
              const uploaded = await uploadImage(file);
              return uploaded.url;
            }}
            errorText={fieldState.error?.message}
          />
        )}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          loading={isPending || form.formState.isSubmitting}
          disabled={
            !form.formState.isDirty || !form.formState.isValid || isPending
          }
        >
          저장
        </Button>
      </div>
    </form>
  );
}
