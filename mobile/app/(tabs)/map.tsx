import { StyleSheet, Text, View } from "react-native";

import { AppScreen, SessionPanel } from "../../components/shell";

export default function MapScreen() {
  return (
    <AppScreen
      eyebrow="Map gate"
      title="지도"
      description="지도 화면의 placeholder입니다. 다음 라운드에서 장소 목록과 필터를 붙일 수 있도록 셸만 열어둡니다."
    >
      <SessionPanel />
      <View style={styles.hero}>
        <Text style={styles.title}>지도</Text>
        <Text style={styles.description}>
          지도 화면의 placeholder입니다. 세션 상태에 따라 추후 공개/보호 뷰를 나누는 기준 자리입니다.
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
