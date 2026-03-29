import { StyleSheet, Text, View } from "react-native";

export default function MeScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.title}>내 정보</Text>
        <Text style={styles.description}>
          세션과 개인 설정이 붙을 기준 화면입니다. 현재는 최소 셸 확인용 placeholder입니다.
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
