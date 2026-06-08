import { Text, View } from "react-native";

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
          <View className="gap-2.5 rounded-3xl border border-border bg-panel-solid p-5">
            <Text className="text-[30px] font-extrabold text-text">
              바이커 전용 영역
            </Text>
            <Text className="text-[15px] leading-5.5 text-muted">
              이후에는 주변 라이더, 위치 공유, 채팅 진입 같은 기능이 이 화면
              기준으로 확장됩니다.
            </Text>
          </View>
        </>
      ) : (
        <AuthRequiredPanel description="주변 라이더와 앱 전용 상호작용 기능은 로그인 후 사용할 수 있습니다." />
      )}
    </AppScreen>
  );
}
