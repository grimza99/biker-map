import { StyleSheet, View } from "react-native";

import { AuthRequiredPanel } from "../../components/shell";
import { useSession } from "../../features/session/model";
import { MapCanvasWebView } from "@/features/map/ui/MapCanvasWebView";
import { Toggle } from "@/shared";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { BikerCard } from "@/entities/live-bikers/ui/BikerCard";

export default function BikersScreen() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [toggle, setToggle] = useState(false);

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
      <SafeAreaView
        className="gap-2.5 px-4.5 pb-3 pt-2"
        edges={["top"]}
        style={styles.toggleOverlay}
      >
        <Toggle
          value={toggle}
          onValueChange={(v) => setToggle(v)}
          label={toggle ? "위치 공유중" : "위치 공유 끔"}
          size="lg"
        />
        <BikerCard
          biker={{
            nickname: "이름",
            bikeBrand: "브랜드",
            bikeModel: "모델",
            distance: "1000",
            proficiency: "중급",
          }}
        />
      </SafeAreaView>
    </View>
  );
}
const styles = StyleSheet.create({
  toggleOverlay: {
    position: "absolute",
    top: 0,
    right: 10,
    left: 0,
    zIndex: 10,
  },
});
