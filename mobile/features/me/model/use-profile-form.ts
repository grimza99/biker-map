import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

import type { AppSession, UpdateMeBody } from "@package-shared/index";

import type { ImageInputAsset } from "@/components/common";

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
  const [profile, setProfile] = useState<UpdateMeBody>(
    createProfileState(currentValue)
  );
  const [avatarAsset, setAvatarAsset] = useState<ImageInputAsset[]>(
    mapInitialAvatarAsset(currentValue?.avatarUrl)
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { mutateAsync: editProfileMutation, isPending } = useUpdateMeMutation();

  const isSubmitting = isPending || isUploadingImage;
  const isDirty = useMemo(
    () =>
      profile.name !== (currentValue?.name || "") ||
      profile.avatarUrl !== (currentValue?.avatarUrl || null) ||
      profile.bikeBrand !== (currentValue?.bikeBrand || "") ||
      profile.bikeModel !== (currentValue?.bikeModel || "") ||
      profile.proficiency !== (currentValue?.proficiency || null),
    [profile, currentValue]
  );

  useEffect(() => {
    setProfile(createProfileState(currentValue));
    setAvatarAsset(mapInitialAvatarAsset(currentValue?.avatarUrl));
  }, [currentValue]);

  const handleChangeInput = (key: keyof UpdateMeBody, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleAvatarChange = (value: ImageInputAsset[] | null) => {
    const nextAssets = value ?? [];
    setAvatarAsset(nextAssets);
    setProfile((prev) => ({
      ...prev,
      avatarUrl: nextAssets[0]?.uri ?? null,
    }));
  };

  const handleChangeProficiency = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      proficiency: value ? (value as UpdateMeBody["proficiency"]) : null,
    }));
  };

  async function handleSubmit() {
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
        ...profile,
        name: profile.name.trim(),
        avatarUrl: nextAvatarUrl,
      });
    } finally {
      setIsUploadingImage(false);
    }
  }

  return {
    avatarAsset,
    handleAvatarChange,
    handleChangeInput,
    handleChangeProficiency,
    handleSubmit,
    isDirty,
    isSubmitting,
    profile,
  };
}

function createProfileState(currentValue: AppSession | null): UpdateMeBody {
  return {
    name: currentValue?.name || "",
    avatarUrl: currentValue?.avatarUrl || null,
    bikeBrand: currentValue?.bikeBrand || "",
    bikeModel: currentValue?.bikeModel || "",
    proficiency: currentValue?.proficiency || null,
  };
}
