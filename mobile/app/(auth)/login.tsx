import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { bikerMapTheme } from "@package-shared/constants/theme";
import { AppScreen } from "../../components/shell";
import { useSession } from "../../features/session/model";

export default function LoginScreen() {
  const router = useRouter();
  const { status, login } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === "loading") {
    return null;
  }

  if (status === "authenticated") {
    return <Redirect href="/(tabs)" />;
  }

  async function handleSignIn() {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login({
        email,
        password,
      });
      router.replace("/(tabs)");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "로그인에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppScreen
      eyebrow="Session gate"
      title="로그인이 필요한 구간"
      description="모바일은 웹 API를 통해 인증하고, 세션/토큰은 기기 보안 저장소에 보관합니다."
    >
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>로그인</Text>
        <Text style={styles.panelDescription}>
          로그인 요청은 웹 auth route를 호출하고, 401 응답 시 refresh token으로 자동 재시도합니다.
        </Text>

        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="이메일"
          placeholderTextColor={bikerMapTheme.colors.muted}
          style={styles.input}
          value={email}
        />
        <TextInput
          autoCapitalize="none"
          onChangeText={setPassword}
          placeholder="비밀번호"
          placeholderTextColor={bikerMapTheme.colors.muted}
          secureTextEntry
          style={styles.input}
          value={password}
        />

        {errorMessage ? (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        ) : null}

        <Pressable
          disabled={isSubmitting}
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={() => void handleSignIn()}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? "로그인 중..." : "로그인하고 앱 셸로 이동"}
          </Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panelSolid,
    padding: 18,
  },
  panelTitle: {
    color: bikerMapTheme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  panelDescription: {
    color: bikerMapTheme.colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panel,
    color: bikerMapTheme.colors.text,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorMessage: {
    color: bikerMapTheme.colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: bikerMapTheme.colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonText: {
    color: bikerMapTheme.colors.bg,
    fontSize: 14,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
