import { StyleSheet, Text, View } from "react-native";

import {
  AppScreen,
  AuthRequiredPanel,
  SessionPanel,
} from "../../components/shell";
import { useSession } from "../../features/session/model";

export default function BikersScreen() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <AppScreen
      eyebrow="Rider feature"
      title="바이커"
      description="앱 전용 라이더 기능이 들어갈 자리입니다. 비로그인 상태에서는 접근 안내만 보여줍니다."
    >
      {isAuthenticated ? (
        <>
          <SessionPanel />
          <View style={styles.hero}>
            <Text style={styles.title}>바이커 전용 영역</Text>
            <Text style={styles.description}>
              이후에는 주변 라이더, 위치 공유, 채팅 진입 같은 기능이 이
              화면 기준으로 확장됩니다.
            </Text>
          </View>
        </>
      ) : (
        <AuthRequiredPanel description="주변 라이더와 앱 전용 상호작용 기능은 로그인 후 사용할 수 있습니다." />
      )}
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
