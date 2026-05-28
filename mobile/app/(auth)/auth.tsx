import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
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

  async function handleSignIn(body: LoginBody) {
    await login(body);
    router.replace(MOBILE_PATHS.map);
  }

  async function handleSignUp(body: SignUpBody) {
    await signUp(body);
    router.replace(MOBILE_PATHS.map);
  }
  return (
    <AppScreen>
      <View style={styles.tabContainer}>
        <Button
          onPress={() => {
            setTab("logIn");
          }}
          variant="secondary"
          style={{ width: 150 }}
        >
          로그인
        </Button>
        <Button
          onPress={() => {
            setTab("signUp");
          }}
          style={{ width: 150 }}
          variant="secondary"
        >
          회원가입
        </Button>
      </View>
      {tab === "logIn" ? (
        <LogInForm onSubmit={handleSignIn} />
      ) : (
        <SignUpForm onSubmit={handleSignUp} />
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
});
