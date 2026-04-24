import { StyleSheet, Text, View } from "react-native";

import { AppScreen, SessionPanel } from "../../components/shell";

export default function CommunityScreen() {
  return (
    <AppScreen
      eyebrow="Community gate"
      title="커뮤니티"
      description="게시글, 댓글, 알림으로 확장될 자리입니다. 지금은 탭 구조와 화면 경계만 고정합니다."
    >
      <SessionPanel />
      <View style={styles.hero}>
        <Text style={styles.title}>커뮤니티</Text>
        <Text style={styles.description}>
          로그인 전과 후의 화면 차이를 붙일 기준 자리입니다.
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
