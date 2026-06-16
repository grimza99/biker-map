import { Alert, Linking, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useEffect, useState } from "react";

import { AppText } from "@/components/common";
import { useCurrentLocation } from "@/features/location/hooks";
import { useSession } from "../../features/session/model";
import { MapCanvasWebView } from "@/features/map/ui/MapCanvasWebView";
import { MOBILE_PATHS, Toggle } from "@/shared";
import { Redirect } from "expo-router";

export default function BikersScreen() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [toggle, setToggle] = useState(false);
  const {
    currentLocation,
    errorMessage,
    isLoading,
    permissionState,
    requestPermission,
  } = useCurrentLocation(isAuthenticated);
  const isLocationServiceDisabled =
    errorMessage ===
    "기기의 위치 서비스가 꺼져 있어 현재 위치를 가져올 수 없습니다.";

  useEffect(() => {
    if (!isLocationServiceDisabled) {
      return;
    }

    Alert.alert(
      "위치 서비스가 꺼져 있습니다",
      "기기 설정에서 위치 서비스를 켜야 현재 위치를 지도에 표시할 수 있습니다.",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "설정으로 이동",
          onPress: () => {
            void Linking.openSettings();
          },
        },
      ]
    );
  }, [isLocationServiceDisabled]);

  if (!isAuthenticated) {
    return <Redirect href={MOBILE_PATHS.auth} />;
  }

  return (
    <View className="bg-bg flex-1">
      <MapCanvasWebView
        activeFilter="all"
        currentLocation={currentLocation}
        places={[]}
        routes={[]}
      />

      <SafeAreaView
        className="px-4.5 pb-3 pt-2"
        edges={["top"]}
        style={styles.overlay}
      >
        <Toggle
          value={toggle}
          onValueChange={(v) => setToggle(v)}
          label={toggle ? "위치 공유중" : "위치 공유 끔"}
          size="lg"
        />
        <View className="gap-3 rounded-[28px] border border-border bg-[rgba(17,19,21,0.9)] px-4.5 py-4">
          {currentLocation ? (
            <AppText className="text-xs font-bold text-text">
              LAT {currentLocation.lat.toFixed(5)} / LNG
              {currentLocation.lng.toFixed(5)}
            </AppText>
          ) : null}

          {isLoading ? (
            <AppText className="text-xs font-bold text-muted">
              현재 위치를 확인하는 중입니다
            </AppText>
          ) : null}

          {errorMessage ? (
            <View className="gap-2">
              <AppText className="text-xs font-bold text-warning">
                {errorMessage}
              </AppText>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    zIndex: 10,
  },
});
