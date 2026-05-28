import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import { bikerMapTheme, LoginBody, SignUpBody } from "@package-shared/index";

import { AppScreen } from "../../components/shell";
import { useSession } from "../../features/session/model";
import { Button } from "@/components/common";
import SignUpForm from "@/features/auth/SignUpForm";
import LogInForm from "@/features/auth/LogInForm";
import { MOBILE_PATHS } from "@/shared/constants/paths";

type AuthTab = "logIn" | "signUp";

export default function AuthScreen() {
  const router = useRouter();
  const { login, signUp } = useSession();
  const [tab, setTab] = useState<AuthTab>("logIn");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      <View style={styles.tabContainer}>
        <Button
          onPress={() => {
            handleSelectTab("logIn");
          }}
          disabled={isSubmitting}
          selected={tab === "logIn"}
          variant="secondary"
          style={{ width: 150 }}
        >
          로그인
        </Button>
        <Button
          onPress={() => {
            handleSelectTab("signUp");
          }}
          disabled={isSubmitting}
          selected={tab === "signUp"}
          style={{ width: 150 }}
          variant="secondary"
        >
          회원가입
        </Button>
      </View>
      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}
      {tab === "logIn" ? (
        <LogInForm
          isSubmitting={isSubmitting}
          onSubmit={handleSignIn}
        />
      ) : (
        <SignUpForm
          isSubmitting={isSubmitting}
          onSubmit={handleSignUp}
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panelSolid,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    gap: 10,
    width: "100%",
  },
  errorMessage: {
    color: bikerMapTheme.colors.danger,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
});
