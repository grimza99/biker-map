import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { LoginBody, SignUpBody } from "@package-shared/index";

import { LoginForm, SignupForm } from "@/features/auth/ui";
import { AppText, Button } from "@/shared";
import { MOBILE_PATHS } from "@/shared/constants/paths";
import { AppScreen } from "@/widgets";
import { useSession } from "../../features/session/model";

type AuthTab = "login" | "signup";

export default function AuthScreen() {
  const router = useRouter();
  const { status, login, signUp } = useSession();
  const [tab, setTab] = useState<AuthTab>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (status === "loading") {
    return null;
  }

  if (status === "authenticated") {
    return <Redirect href={MOBILE_PATHS.map} />;
  }

  async function handleLogin(body: LoginBody) {
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
            handleSelectTab("login");
          }}
          disabled={isSubmitting}
          selected={tab === "login"}
          variant="secondary"
          className="w-37.5"
        >
          로그인
        </Button>
        <Button
          onPress={() => {
            handleSelectTab("signup");
          }}
          disabled={isSubmitting}
          selected={tab === "signup"}
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
      {tab === "login" ? (
        <LoginForm isSubmitting={isSubmitting} onSubmit={handleLogin} />
      ) : (
        <SignupForm isSubmitting={isSubmitting} onSubmit={handleSignUp} />
      )}
    </AppScreen>
  );
}
