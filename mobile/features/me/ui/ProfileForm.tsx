import { View } from "react-native";

import { AppSession, proficiencySelectOptions } from "@package-shared/index";

import { Button, ImageInput, Input } from "@/components/common";
import { formBase } from "@/features/auth/form-style";
import { useProfileForm } from "@/features/me";
import { SelectInput } from "@/shared";

interface IProfileFormProps {
  currenValue: AppSession | null;
}

export function ProfileForm({ currenValue }: IProfileFormProps) {
  const {
    avatarAsset,
    handleAvatarChange,
    handleChangeInput,
    handleChangeProficiency,
    handleSubmit,
    isDirty,
    isSubmitting,
    profile,
  } = useProfileForm({
    currentValue: currenValue,
  });

  return (
    <View className={formBase.formContainer}>
      <Input
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isSubmitting}
        onChangeText={(v) => handleChangeInput("name", v)}
        placeholder="이름을 입력해주세요"
        value={profile.name}
      />
      <ImageInput
        label="프로필 이미지"
        value={avatarAsset}
        maxImages={1}
        disabled={isSubmitting}
        onValueChange={handleAvatarChange}
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
        value={profile.proficiency ?? ""}
        onValueChange={handleChangeProficiency}
      />
      <Button
        disabled={!profile.name.trim() || !isDirty || isSubmitting}
        loading={isSubmitting}
        onPress={() => {
          void handleSubmit();
        }}
      >
        수정
      </Button>
    </View>
  );
}
