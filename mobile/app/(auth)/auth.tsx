import { Redirect, useRouter } from "expo-router";
import { View } from "react-native";
import { useState } from "react";

import { LoginBody, SignUpBody } from "@package-shared/index";

import { AppScreen } from "../../components/shell";
import { useSession } from "../../features/session/model";
import { AppText, Button } from "@/components/common";
import SignUpForm from "@/features/auth/SignUpForm";
import LogInForm from "@/features/auth/LogInForm";
import { MOBILE_PATHS } from "@/shared/constants/paths";

type AuthTab = "logIn" | "signUp";

export default function AuthScreen() {
  const router = useRouter();
  const { status, login, signUp } = useSession();
  const [tab, setTab] = useState<AuthTab>("logIn");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (status === "loading") {
    return null;
  }

  if (status === "authenticated") {
    return <Redirect href={MOBILE_PATHS.map} />;
  }

  async function handleSignIn(body: LoginBody) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login(body);
      router.replace(MOBILE_PATHS.map);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "로그인에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignUp(body: SignUpBody) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await signUp(body);
      router.replace(MOBILE_PATHS.map);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "회원가입에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSelectTab(nextTab: AuthTab) {
    setTab(nextTab);
    setErrorMessage(null);
  }

  return (
    <AppScreen>
      <View className="w-full flex-row items-center justify-evenly gap-2.5 rounded-[20px] border border-border bg-panel-solid p-4.5">
        <Button
          onPress={() => {
            handleSelectTab("logIn");
          }}
          disabled={isSubmitting}
          selected={tab === "logIn"}
          variant="secondary"
          className="w-37.5"
        >
          로그인
        </Button>
        <Button
          onPress={() => {
            handleSelectTab("signUp");
          }}
          disabled={isSubmitting}
          selected={tab === "signUp"}
          variant="secondary"
          className="w-37.5"
        >
          회원가입
        </Button>
      </View>
      {errorMessage && (
        <AppText className="text-sm font-semibold leading-5" tone="danger">
          {errorMessage}
        </AppText>
      )}
      {tab === "logIn" ? (
        <LogInForm isSubmitting={isSubmitting} onSubmit={handleSignIn} />
      ) : (
        <SignUpForm isSubmitting={isSubmitting} onSubmit={handleSignUp} />
      )}
    </AppScreen>
  );
}
