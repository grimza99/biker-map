import { View } from "react-native";

import { AuthRequiredPanel } from "../../components/shell";
import { useSession } from "../../features/session/model";
import { MapCanvasWebView } from "@/features/map/ui/MapCanvasWebView";

export default function BikersScreen() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  if (!isAuthenticated) {
    return (
      <View className="bg-bg flex-1 px-5 pt-6">
        <AuthRequiredPanel description="주변 라이더와 앱 전용 상호작용 기능은 로그인 후 사용할 수 있습니다." />
      </View>
    );
  }

  return (
    <View className="bg-bg flex-1">
      <MapCanvasWebView activeFilter="all" places={[]} routes={[]} />
    </View>
  );
}
