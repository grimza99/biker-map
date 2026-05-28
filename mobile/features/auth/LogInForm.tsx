import { useState } from "react";
import { ScrollView } from "react-native";

import { LoginBody } from "@package-shared/index";

import { Button, Input } from "@/components/common";
import { containerStyles } from "@/shared";
import { formStyles } from "./form-style";

interface ILogInForm {
  onSubmit: (body: LoginBody) => void;
}
export default function LogInForm({ onSubmit }: ILogInForm) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <ScrollView style={[containerStyles.panel, formStyles.formContainer]}>
      <Input
        label="이메일"
        onChange={(e) => {
          setEmail(e.nativeEvent.text);
        }}
        style={{ gap: 10 }}
        fieldStyle={formStyles.fieldStyle}
      />
      <Input
        label="비밀번호"
        onChange={(e) => {
          setPassword(e.nativeEvent.text);
        }}
        style={{ gap: 10 }}
        fieldStyle={formStyles.fieldStyle}
      />
      <Button onPress={() => onSubmit({ email, password })}>로그인</Button>
    </ScrollView>
  );
}
