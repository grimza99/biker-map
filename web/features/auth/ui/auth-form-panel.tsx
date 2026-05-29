"use client";

import type { LoginBody, SignUpBody } from "@package-shared/types/auth";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  Button,
  DefaultCardContainer,
  Input,
  Tabs,
  TabsContent,
  TabsList,
} from "@shared/ui";

import {
  type AuthTabValue,
  loginFormSchema,
  signUpFormSchema,
} from "../model/auth-schemas";
import {
  type AuthActionState,
  loginAction,
  signUpAction,
} from "../actions";

type AuthFormPanelProps = {
  defaultTab?: AuthTabValue;
};

const authActionInitialState: AuthActionState = {
  message: null,
};

export function AuthFormPanel({ defaultTab = "login" }: AuthFormPanelProps) {
  const [tab, setTab] = useState<AuthTabValue>(defaultTab);
  const [loginState, loginFormAction] = useActionState(
    loginAction,
    authActionInitialState
  );
  const [signUpState, signUpFormAction] = useActionState(
    signUpAction,
    authActionInitialState
  );
  const [loginValues, setLoginValues] = useState<LoginBody>({
    email: "",
    password: "",
  });
  const [signUpValues, setSignUpValues] = useState<SignUpBody>({
    email: "",
    password: "",
    name: "",
  });

  const loginValidation = loginFormSchema.safeParse(loginValues);
  const signUpValidation = signUpFormSchema.safeParse(signUpValues);

  const loginError = useMemo(() => {
    if (loginValidation.success) {
      return null;
    }

    return loginValidation.error.issues[0]?.message ?? null;
  }, [loginValidation]);

  const signUpError = useMemo(() => {
    if (signUpValidation.success) {
      return null;
    }

    return signUpValidation.error.issues[0]?.message ?? null;
  }, [signUpValidation]);

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as AuthTabValue)}
      className="gap-5"
    >
      <TabsList
        className="w-full justify-center rounded-[18px] border border-border bg-panel-soft p-1"
        items={[
          { value: "login", label: "로그인" },
          { value: "signup", label: "회원가입" },
        ]}
      />

      <TabsContent value="login">
        <DefaultCardContainer className="gap-5 rounded-[28px] p-6 md:p-7">
          <h2 className="text-center m-0 text-2xl font-semibold tracking-[var(--tracking-heading-md)] text-text">
            바이커맵 로그인
          </h2>

          <form className="grid gap-4" action={loginFormAction}>
            <Input
              label="이메일"
              type="email"
              name="email"
              placeholder="rider@example.com"
              value={loginValues.email}
              onChange={(event) =>
                setLoginValues((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
            <Input
              label="비밀번호"
              type="password"
              name="password"
              placeholder="6자 이상 입력"
              value={loginValues.password}
              onChange={(event) =>
                setLoginValues((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
            />

            {loginError ? (
              <p className="m-0 rounded-[16px] border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
                {loginError}
              </p>
            ) : null}
            {loginState.message ? (
              <p className="m-0 rounded-[16px] border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
                {loginState.message}
              </p>
            ) : null}

            <AuthSubmitButton disabled={!loginValidation.success}>
              로그인
            </AuthSubmitButton>
          </form>
        </DefaultCardContainer>
      </TabsContent>

      <TabsContent value="signup">
        <DefaultCardContainer className="gap-5 rounded-[28px] p-6 md:p-7">
          <h2 className="text-center m-0 text-2xl font-semibold tracking-[var(--tracking-heading-md)] text-text">
            바이커맵 계정 만들기
          </h2>
          <form className="grid gap-4" action={signUpFormAction}>
            <Input
              label="이름"
              name="name"
              placeholder="라이더 이름"
              value={signUpValues.name}
              onChange={(event) =>
                setSignUpValues((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
            <Input
              label="이메일"
              type="email"
              name="email"
              placeholder="rider@example.com"
              value={signUpValues.email}
              onChange={(event) =>
                setSignUpValues((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
            <Input
              label="비밀번호"
              type="password"
              name="password"
              placeholder="6자 이상 입력"
              value={signUpValues.password}
              onChange={(event) =>
                setSignUpValues((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
            />

            {signUpError ? (
              <p className="m-0 rounded-[16px] border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
                {signUpError}
              </p>
            ) : null}
            {signUpState.message ? (
              <p className="m-0 rounded-[16px] border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
                {signUpState.message}
              </p>
            ) : null}

            <AuthSubmitButton disabled={!signUpValidation.success}>
              회원가입
            </AuthSubmitButton>
          </form>
        </DefaultCardContainer>
      </TabsContent>
    </Tabs>
  );
}

function AuthSubmitButton({
  children,
  disabled,
}: {
  children: string;
  disabled: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" loading={pending} disabled={disabled}>
      {children}
    </Button>
  );
}
