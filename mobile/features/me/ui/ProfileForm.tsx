import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import {
  AppSession,
  proficiencySelectOptions,
  UpdateMeBody,
} from "@package-shared/index";

import { Button, Input } from "@/components/common";
import { formBase } from "@/features/auth/form-style";
import { useUpdateMeMutation } from "@/features/me";
import { SelectInput } from "@/shared";

interface IProfileFormProps {
  currenValue: AppSession | null;
}
export function ProfileForm({ currenValue }: IProfileFormProps) {
  const [profile, setProfile] = useState<UpdateMeBody>({
    name: currenValue?.name || "",
    avatarUrl: currenValue?.avatarUrl || null,
    bikeBrand: currenValue?.bikeBrand || "",
    bikeModel: currenValue?.bikeModel || "",
    proficiency: currenValue?.proficiency || null,
  });

  const { mutateAsync: editProfileMutation } = useUpdateMeMutation();

  const handleSubmit = (payload: UpdateMeBody) => {
    editProfileMutation(payload);
  };

  const isSubmitting = false;
  const isDirty = useMemo(
    () =>
      profile.name !== (currenValue?.name || "") ||
      profile.avatarUrl !== (currenValue?.avatarUrl || "") ||
      profile.bikeBrand !== (currenValue?.bikeBrand || "") ||
      profile.bikeModel !== (currenValue?.bikeModel || ""),
    [
      profile.name,
      profile.avatarUrl,
      profile.bikeBrand,
      profile.bikeModel,
      currenValue,
    ]
  );

  useEffect(() => {
    setProfile({
      name: currenValue?.name || "",
      avatarUrl: currenValue?.avatarUrl || null,
      bikeBrand: currenValue?.bikeBrand || "",
      bikeModel: currenValue?.bikeModel || "",
      proficiency: currenValue?.proficiency || null,
    });
  }, [
    currenValue?.name,
    currenValue?.avatarUrl,
    currenValue?.bikeBrand,
    currenValue?.bikeModel,
    currenValue?.proficiency,
  ]);

  const handleChangeInput = (key: string, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <View className={formBase.formContainer}>
      <Input
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isSubmitting}
        onChangeText={(v) => handleChangeInput("name", v)}
        placeholder="이름을 입력해주세요"
        defaultValue={profile.name}
      />
      <Input
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isSubmitting}
        onChangeText={(v) => handleChangeInput("avatarUrl", v)}
        placeholder="프로필 이미지"
        keyboardType="url"
        value={profile.avatarUrl || undefined}
      />
      <Input
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isSubmitting}
        onChangeText={(v) => handleChangeInput("bikeBrand", v)}
        placeholder="브랜드"
        value={profile.bikeBrand || ""}
      />
      <Input
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isSubmitting}
        onChangeText={(v) => handleChangeInput("bikeModel", v)}
        placeholder="모델명"
        value={profile.bikeModel || ""}
      />
      <SelectInput
        options={proficiencySelectOptions}
        placeholder="라이딩 숙련도"
        value={currenValue?.proficiency ?? ""}
      />
      <Button
        disabled={!profile.name || !isDirty}
        loading={isSubmitting}
        onPress={() => void handleSubmit(profile)}
      >
        수정
      </Button>
    </View>
  );
}
