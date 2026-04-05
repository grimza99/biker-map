"use client";

import { API_PATHS } from "@package-shared/constants/api";
import type {
  AuthResponseData,
  LoginBody,
  SignUpBody,
} from "@package-shared/types/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useSession } from "@features/session";
import { ApiClientError, apiFetch } from "@shared/api/http";
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

type AuthFormPanelProps = {
  defaultTab?: AuthTabValue;
};

export function AuthFormPanel({ defaultTab = "login" }: AuthFormPanelProps) {
  const [tab, setTab] = useState<AuthTabValue>(defaultTab);
  const [isDirty, setIsDirty] = useState(false);

  const [loginValues, setLoginValues] = useState<LoginBody>({
    email: "",
    password: "",
  });
  const [signUpValues, setSignUpValues] = useState<SignUpBody>({
    email: "",
    password: "",
    name: "",
  });

  const router = useRouter();
  const { setSession } = useSession();

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

  const loginMutation = useMutation({
    mutationFn: (payload: LoginBody) =>
      apiFetch<AuthResponseData>(API_PATHS.auth.login, {
        method: "POST",
        body: JSON.stringify(payload),
        credentials: "include",
      }),
    onSuccess(response) {
      setSession(response.data.session);
      router.push("/map");
      router.refresh();
    },
  });

  const signUpMutation = useMutation({
    mutationFn: (payload: SignUpBody) =>
      apiFetch<AuthResponseData>(API_PATHS.auth.signup, {
        method: "POST",
        body: JSON.stringify(payload),
        credentials: "include",
      }),
    onSuccess(response) {
      setSession(response.data.session);
      router.push("/map");
      router.refresh();
    },
  });

  const loginMutationError =
    loginMutation.error instanceof ApiClientError
      ? loginMutation.error.message
      : loginMutation.error instanceof Error
      ? loginMutation.error.message
      : null;

  const signUpMutationError =
    signUpMutation.error instanceof ApiClientError
      ? signUpMutation.error.message
      : signUpMutation.error instanceof Error
      ? signUpMutation.error.message
      : null;

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

          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();

              if (!loginValidation.success) {
                return;
              }

              loginMutation.mutate(loginValidation.data);
            }}
          >
            <Input
              label="이메일"
              type="email"
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
            {loginMutationError ? (
              <p className="m-0 rounded-[16px] border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
                {loginMutationError}
              </p>
            ) : null}

            <Button
              type="submit"
              loading={loginMutation.isPending}
              disabled={!loginValidation.success}
            >
              로그인
            </Button>
          </form>
        </DefaultCardContainer>
      </TabsContent>

      <TabsContent value="signup">
        <DefaultCardContainer className="gap-5 rounded-[28px] p-6 md:p-7">
          <h2 className="text-center m-0 text-2xl font-semibold tracking-[var(--tracking-heading-md)] text-text">
            바이커맵 계정 만들기
          </h2>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();

              if (!signUpValidation.success) {
                return;
              }

              signUpMutation.mutate(signUpValidation.data);
            }}
          >
            <Input
              label="이름"
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
            {signUpMutationError ? (
              <p className="m-0 rounded-[16px] border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
                {signUpMutationError}
              </p>
            ) : null}

            <Button
              type="submit"
              loading={signUpMutation.isPending}
              disabled={!signUpValidation.success}
            >
              회원가입
            </Button>
          </form>
        </DefaultCardContainer>
      </TabsContent>
    </Tabs>
  );
}
