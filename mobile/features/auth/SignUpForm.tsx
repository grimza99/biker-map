import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollView, View } from "react-native";
import { Controller, useForm } from "react-hook-form";

import { SignUpBody, signUpSchema } from "@package-shared/index";

import { Button, Input } from "@/components/common";
import { formBase } from "./form-style";
import { containerBase } from "@/shared";

interface ISignUpForm {
  isSubmitting?: boolean;
  onSubmit: (body: SignUpBody) => Promise<void>;
}
export default function SignUpForm({
  isSubmitting = false,
  onSubmit,
}: ISignUpForm) {
  const form = useForm<SignUpBody>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <ScrollView className={containerBase.panel}>
      <View className={formBase.formContainer}>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Input
              editable={!isSubmitting}
              label="이름"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="이름"
              className="gap-2.5"
              errorText={fieldState.error?.message}
              fieldClassName="bg-panel-solid"
              value={field.value}
            />
          )}
        />
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Input
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
              keyboardType="email-address"
              label="이메일"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="email@example.com"
              className="gap-2.5"
              errorText={fieldState.error?.message}
              fieldClassName="bg-panel-solid"
              value={field.value}
            />
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Input
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
              label="비밀번호"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="비밀번호"
              secureTextEntry
              className="gap-2.5"
              errorText={fieldState.error?.message}
              fieldClassName="bg-panel-solid"
              value={field.value}
            />
          )}
        />
        <Button
          disabled={!form.formState.isValid || isSubmitting}
          loading={isSubmitting}
          onPress={() => void handleSubmit()}
        >
          회원가입
        </Button>
      </View>
    </ScrollView>
  );
}
