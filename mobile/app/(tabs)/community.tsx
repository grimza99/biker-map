import { StyleSheet, Text, View } from "react-native";

export default function CommunityScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.title}>커뮤니티</Text>
        <Text style={styles.description}>
          게시글, 댓글, 알림으로 확장될 자리입니다. 지금은 탭 구조와 화면 경계만 고정합니다.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#081120",
    padding: 20,
  },
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
