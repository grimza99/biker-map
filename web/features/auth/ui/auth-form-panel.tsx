"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { LoginBody, SignUpBody } from "@package-shared/types/auth";
import { startTransition, useActionState, useState } from "react";
import { useForm } from "react-hook-form";

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
  const [loginState, loginFormAction, isLoginPending] = useActionState(
    loginAction,
    authActionInitialState
  );
  const [signUpState, signUpFormAction, isSignUpPending] = useActionState(
    signUpAction,
    authActionInitialState
  );
  const loginForm = useForm<LoginBody>({
    resolver: zodResolver(loginFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const signUpForm = useForm<SignUpBody>({
    resolver: zodResolver(signUpFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const submitLogin = loginForm.handleSubmit((values) => {
    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);

    startTransition(() => {
      void loginFormAction(formData);
    });
  });

  const submitSignUp = signUpForm.handleSubmit((values) => {
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("email", values.email);
    formData.set("password", values.password);

    startTransition(() => {
      void signUpFormAction(formData);
    });
  });

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

          <form className="grid gap-4" onSubmit={submitLogin} noValidate>
            <Input
              label="이메일"
              type="email"
              placeholder="rider@example.com"
              errorText={loginForm.formState.errors.email?.message}
              {...loginForm.register("email")}
            />
            <Input
              label="비밀번호"
              type="password"
              placeholder="8자 이상 입력"
              errorText={loginForm.formState.errors.password?.message}
              {...loginForm.register("password")}
            />

            {loginState.message ? (
              <p className="m-0 rounded-[16px] border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
                {loginState.message}
              </p>
            ) : null}

            <AuthSubmitButton
              loading={isLoginPending}
              disabled={!loginForm.formState.isValid || isLoginPending}
            >
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
          <form className="grid gap-4" onSubmit={submitSignUp} noValidate>
            <Input
              label="이름"
              placeholder="라이더 이름"
              errorText={signUpForm.formState.errors.name?.message}
              {...signUpForm.register("name")}
            />
            <Input
              label="이메일"
              type="email"
              placeholder="rider@example.com"
              errorText={signUpForm.formState.errors.email?.message}
              {...signUpForm.register("email")}
            />
            <Input
              label="비밀번호"
              type="password"
              placeholder="8자 이상 입력"
              errorText={signUpForm.formState.errors.password?.message}
              {...signUpForm.register("password")}
            />

            {signUpState.message ? (
              <p className="m-0 rounded-[16px] border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
                {signUpState.message}
              </p>
            ) : null}

            <AuthSubmitButton
              loading={isSignUpPending}
              disabled={!signUpForm.formState.isValid || isSignUpPending}
            >
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
  loading,
}: {
  children: string;
  disabled: boolean;
  loading: boolean;
}) {
  return (
    <Button type="submit" loading={loading} disabled={disabled}>
      {children}
    </Button>
  );
}
