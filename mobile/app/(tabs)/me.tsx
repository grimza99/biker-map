import { StyleSheet, Text, View } from "react-native";

import { AppScreen, SessionPanel } from "../../components/shell";

export default function MeScreen() {
  return (
    <AppScreen
      eyebrow="Profile gate"
      title="내 정보"
      description="세션과 개인 설정이 붙을 기준 화면입니다. 현재는 최소 셸 확인용 placeholder입니다."
    >
      <SessionPanel />
      <View style={styles.hero}>
        <Text style={styles.title}>내 정보</Text>
        <Text style={styles.description}>
          로그인 상태를 보여주고, 이후에는 세션 종료나 개인 설정으로 확장할 수 있습니다.
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1c334d",
    backgroundColor: "#0e1d31",
    padding: 20,
    gap: 10,
  },
  title: {
    color: "#f3fbff",
    fontSize: 30,
    fontWeight: "800",
  },
  description: {
    color: "#b5c6d8",
    fontSize: 15,
    lineHeight: 22,
  },
});
