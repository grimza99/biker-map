import { useState } from "react";
import { ScrollView, View } from "react-native";

import { LoginBody } from "@package-shared/index";

import { Button, Input } from "@/components/common";
import { formBase } from "./form-style";
import { containerBase } from "@/shared";

interface ILogInForm {
  isSubmitting?: boolean;
  onSubmit: (body: LoginBody) => Promise<void>;
}
export default function LogInForm({
  isSubmitting = false,
  onSubmit,
}: ILogInForm) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <ScrollView className={containerBase.panel}>
      <View className={formBase.formContainer}>
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSubmitting}
          keyboardType="email-address"
          label="이메일"
          onChangeText={setEmail}
          placeholder="email@example.com"
          className="gap-2.5"
          fieldClassName="bg-panel-solid"
          value={email}
        />
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSubmitting}
          label="비밀번호"
          onChangeText={setPassword}
          placeholder="비밀번호"
          secureTextEntry
          className="gap-2.5"
          fieldClassName="bg-panel-solid"
          value={password}
        />
        <Button
          disabled={!email || !password}
          loading={isSubmitting}
          onPress={() => void onSubmit({ email, password })}
        >
          로그인
        </Button>
      </View>
    </ScrollView>
  );
}
