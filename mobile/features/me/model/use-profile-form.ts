import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";

import {
  createProfileFormDefaultValues,
  profileFormSchema,
  type AppSession,
  type ProfileFormInput,
  type ProfileFormValues,
} from "@package-shared/index";

import { ImageInputAsset } from "@/shared";
import {
  hasLocalAvatarAsset,
  mapInitialAvatarAsset,
  resolveAvatarUrl,
} from "./profile-image";
import { useUpdateMeMutation } from "./use-update-me-mutation";

interface UseProfileFormParams {
  currentValue: AppSession | null;
}

export function useProfileForm({ currentValue }: UseProfileFormParams) {
  const defaultValues = useMemo(
    () => createProfileFormDefaultValues(currentValue),
    [currentValue]
  );
  const resetKey = useMemo(
    () => JSON.stringify(defaultValues),
    [defaultValues]
  );
  const [avatarAsset, setAvatarAsset] = useState<ImageInputAsset[]>(
    mapInitialAvatarAsset(defaultValues.avatarUrl)
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { mutateAsync: editProfileMutation, isPending } = useUpdateMeMutation();
  const form = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues,
  });
  const lastResetKeyRef = useRef(resetKey);

  const isSubmitting = isPending || isUploadingImage;
  const profile = form.watch();
  const isDirty = form.formState.isDirty;

  useEffect(() => {
    if (lastResetKeyRef.current === resetKey) {
      return;
    }

    lastResetKeyRef.current = resetKey;
    form.reset(defaultValues);
    setAvatarAsset(mapInitialAvatarAsset(defaultValues.avatarUrl));
  }, [defaultValues, form, resetKey]);

  const handleAvatarChange = (value: ImageInputAsset[] | null) => {
    const nextAssets = value ?? [];
    setAvatarAsset(nextAssets);
    form.setValue("avatarUrl", nextAssets[0]?.uri ?? null, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    let nextAvatarUrl: string | null;

    try {
      if (hasLocalAvatarAsset(avatarAsset)) {
        setIsUploadingImage(true);
      }

      nextAvatarUrl = await resolveAvatarUrl(avatarAsset);
    } catch (error) {
      Alert.alert(
        "프로필 이미지 업로드 실패",
        error instanceof Error ? error.message : "오류가 발생했습니다."
      );
      setIsUploadingImage(false);
      return;
    }

    try {
      await editProfileMutation({
        ...values,
        avatarUrl: nextAvatarUrl,
      });
    } finally {
      setIsUploadingImage(false);
    }
  });

  return {
    avatarAsset,
    form,
    handleAvatarChange,
    handleSubmit,
    isDirty,
    isSubmitting,
    profile,
  };
}
