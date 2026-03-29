import { StyleSheet, Text, View } from "react-native";

export default function MapScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.title}>지도</Text>
        <Text style={styles.description}>
          지도 화면의 placeholder입니다. 다음 라운드에서 장소 목록과 필터를 붙일 수 있도록 셸만 열어둡니다.
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
