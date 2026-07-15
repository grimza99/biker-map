import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";

import { LoginBody, loginSchema } from "@package-shared/index";

import { Button, containerBase, Input } from "@/shared";
import { formBase } from "./form-style";

interface ILogInForm {
  isSubmitting?: boolean;
  onSubmit: (body: LoginBody) => Promise<void>;
}
export default function LogInForm({
  isSubmitting = false,
  onSubmit,
}: ILogInForm) {
  const form = useForm<LoginBody>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
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
          로그인
        </Button>
      </View>
    </ScrollView>
  );
}
