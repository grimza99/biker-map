import { useState } from "react";
import { ScrollView } from "react-native";

import { SignUpBody } from "@package-shared/index";

import { Button, Input } from "@/components/common";
import { containerStyles } from "@/shared";
import { formStyles } from "./form-style";

interface ISignUpForm {
  onSubmit: (body: SignUpBody) => void;
}
export default function SignUpForm({ onSubmit }: ISignUpForm) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <ScrollView style={[containerStyles.panel, formStyles.formContainer]}>
      <Input
        label="이름"
        onChange={(e) => {
          setName(e.nativeEvent.text);
        }}
        style={{ gap: 10 }}
        fieldStyle={formStyles.fieldStyle}
      />
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
      <Button onPress={() => onSubmit({ name, email, password })}>
        회원가입
      </Button>
    </ScrollView>
  );
}
