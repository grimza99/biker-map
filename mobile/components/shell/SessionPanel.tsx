import { Pressable, StyleSheet, Text, View } from "react-native";

import { bikerMapTheme } from "@package-shared/constants/theme";
import { useSession } from "../../features/session/model";

export function SessionPanel() {
  const { status, user, signIn, signOut } = useSession();

  const isAuthenticated = status === "authenticated";

  return (
    <View style={styles.panel}>
      <Text style={styles.label}>세션 상태</Text>
      <Text style={styles.title}>{isAuthenticated ? "authenticated" : "anonymous"}</Text>
      <Text style={styles.description}>
        {isAuthenticated
          ? `${user?.name ?? "사용자"}가 로그인된 상태입니다. 탭 화면은 이 상태를 기준으로 확장됩니다.`
          : "로그인 전 상태입니다. 현재는 gate 구조만 열려 있습니다."}
      </Text>

      <Pressable style={styles.button} onPress={isAuthenticated ? signOut : signIn}>
        <Text style={styles.buttonText}>{isAuthenticated ? "로그아웃" : "로그인 상태로 전환"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panelSolid,
    padding: 18,
  },
  label: {
    color: bikerMapTheme.colors.active,
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  title: {
    color: bikerMapTheme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  description: {
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
