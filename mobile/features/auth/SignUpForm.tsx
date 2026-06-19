import { useState } from "react";
import { ScrollView, View } from "react-native";

import { SignUpBody } from "@package-shared/index";

import { Button, Input } from "@/components/common";
import { containerStyles } from "@/shared";
import { formStyles } from "./form-style";

interface ISignUpForm {
  isSubmitting?: boolean;
  onSubmit: (body: SignUpBody) => Promise<void>;
}
export default function SignUpForm({
  isSubmitting = false,
  onSubmit,
}: ISignUpForm) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <ScrollView style={[containerStyles.panel]}>
      <View style={[formStyles.formContainer]}>
        <Input
          editable={!isSubmitting}
          label="이름"
          onChangeText={setName}
          placeholder="이름"
          style={{ gap: 10 }}
          fieldStyle={formStyles.fieldStyle}
          value={name}
        />
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSubmitting}
          keyboardType="email-address"
          label="이메일"
          onChangeText={setEmail}
          placeholder="email@example.com"
          style={{ gap: 10 }}
          fieldStyle={formStyles.fieldStyle}
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
          style={{ gap: 10 }}
          fieldStyle={formStyles.fieldStyle}
          value={password}
        />
        <Button
          disabled={!name || !email || !password}
          loading={isSubmitting}
          onPress={() => void onSubmit({ name, email, password })}
        >
          회원가입
        </Button>
      </View>
    </ScrollView>
  );
}
