import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { bikerMapTheme } from "@package-shared/constants/theme";
import { AppScreen } from "../../components/shell";
import { useSession } from "../../features/session/model";

export default function LoginScreen() {
  const router = useRouter();
  const { status, signIn } = useSession();

  const handleSignIn = () => {
    signIn();
    router.replace("/(tabs)");
  };

  return (
    <AppScreen
      eyebrow="Session gate"
      title="로그인이 필요한 구간"
      description="현재는 세션 분기 초안만 연결되어 있습니다. 다음 단계에서 실제 인증 공급자를 붙일 수 있습니다."
    >
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>현재 상태: {status === "authenticated" ? "authenticated" : "anonymous"}</Text>
        <Text style={styles.panelDescription}>
          인증이 붙기 전이라도 라우팅 구조는 먼저 고정합니다. 로그인 버튼을 누르면 탭 셸로 이동합니다.
        </Text>

        <Pressable style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>로그인하고 앱 셸로 이동</Text>
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
});
