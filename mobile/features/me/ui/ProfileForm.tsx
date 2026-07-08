import { Controller } from "react-hook-form";
import { View } from "react-native";

import { AppSession, proficiencySelectOptions } from "@package-shared/index";

import { Button } from "@/components/common";
import { formBase } from "@/features/auth/form-style";
import { useProfileForm } from "@/features/me";
import { ImageInput, Input, SelectInput } from "@/shared";

interface IProfileFormProps {
  currenValue: AppSession | null;
}

export function ProfileForm({ currenValue }: IProfileFormProps) {
  const {
    avatarAsset,
    form,
    handleAvatarChange,
    handleSubmit,
    isDirty,
    isSubmitting,
  } = useProfileForm({
    currentValue: currenValue,
  });

  return (
    <View className={formBase.formContainer}>
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            placeholder="이름을 입력해주세요"
            value={field.value}
            errorText={fieldState.error?.message}
          />
        )}
      />
      <ImageInput
        label="프로필 이미지"
        value={avatarAsset}
        maxImages={1}
        disabled={isSubmitting}
        onValueChange={handleAvatarChange}
        errorText={form.formState.errors.avatarUrl?.message}
      />
      <Controller
        control={form.control}
        name="bikeBrand"
        render={({ field, fieldState }) => (
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            placeholder="브랜드"
            value={field.value}
            errorText={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={form.control}
        name="bikeModel"
        render={({ field, fieldState }) => (
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            placeholder="모델명"
            value={field.value}
            errorText={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={form.control}
        name="proficiency"
        render={({ field, fieldState }) => (
          <SelectInput
            options={proficiencySelectOptions}
            placeholder="라이딩 숙련도"
            value={field.value ?? ""}
            onValueChange={field.onChange}
            errorText={fieldState.error?.message}
          />
        )}
      />
      <Button
        disabled={!form.formState.isValid || !isDirty || isSubmitting}
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
