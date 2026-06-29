import { useEffect, useState } from "react";

import { Href, useRouter } from "expo-router";
import { Alert, Linking, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, Button } from "@/components/common";
import { BikersBottomSheet } from "@/entities/bikers/ui/BikersBottomSheet";
import {
  useEnsureDirectChatRoomMutation,
  useLiveBikers,
} from "@/features/bikers";
import { useCurrentLocation } from "@/features/location/hooks";
import { MapCanvasWebView } from "@/features/map/ui/MapCanvasWebView";
import { useSession } from "@/features/session/model";
import { MOBILE_PATHS, Toggle } from "@/shared";

export default function BikersScreen() {
  const { status, user } = useSession();
  const router = useRouter();
  const isAuthenticated = status === "authenticated";
  const isVerified = user?.isVerified === true;
  const canUseLiveBikers = isAuthenticated && isVerified;
  const [pendingChatUserId, setPendingChatUserId] = useState<string | null>(
    null
  );
  const { currentLocation, errorMessage, isLoading } =
    useCurrentLocation(canUseLiveBikers);
  const {
    errorMessage: liveBikersErrorMessage,
    isSharingEnabled,
    isSyncing,
    nearbyBikers,
    toggleSharing,
  } = useLiveBikers({
    currentLocation,
    enabled: canUseLiveBikers,
  });
  const ensureDirectChatRoomMutation = useEnsureDirectChatRoomMutation();
  const isLocationServiceDisabled =
    errorMessage ===
    "기기의 위치 서비스가 꺼져 있어 현재 위치를 가져올 수 없습니다.";

  useEffect(() => {
    if (!canUseLiveBikers || !isLocationServiceDisabled) {
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
  }, [canUseLiveBikers, isLocationServiceDisabled]);

  if (status === "loading") {
    return (
      <SafeAreaView
        className="flex-1 bg-bg px-4.5 py-6"
        edges={["top", "bottom"]}
      >
        <View className="flex-1 justify-center rounded-[28px] border border-border bg-panel px-5 py-6">
          <AppText className="text-center text-sm font-bold text-muted">
            세션 정보를 확인하는 중입니다.
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  if (status === "anonymous") {
    return (
      <SafeAreaView
        className="flex-1 bg-bg px-4.5 py-6"
        edges={["top", "bottom"]}
      >
        <View className="flex-1 justify-center gap-4 rounded-[28px] border border-border bg-panel px-5 py-6">
          <AppText className="text-[24px] font-extrabold text-text">
            라이브 바이커는 로그인 후 이용할 수 있습니다.
          </AppText>
          <AppText className="text-sm leading-5 text-muted">
            주변 바이커 위치 공유와 실시간 연결은 로그인된 계정에서만 열립니다.
          </AppText>
          <Button
            fullWidth
            onPress={() => {
              router.push(MOBILE_PATHS.auth);
            }}
          >
            로그인 하러 가기
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!isVerified) {
    return (
      <SafeAreaView
        className="flex-1 bg-bg px-4.5 py-6"
        edges={["top", "bottom"]}
      >
        <View className="flex-1 justify-center gap-4 rounded-[28px] border border-border bg-panel px-5 py-6">
          <AppText className="text-[24px] font-extrabold text-text">
            본인인증이 완료되어야 라이브 바이커를 사용할 수 있습니다.
          </AppText>
          <AppText className="text-sm leading-5 text-muted">
            인증 전에는 지도, 위치 권한 요청, 실시간 연결, 주변 바이커 조회와
            위치 공유가 모두 차단됩니다.
          </AppText>
          <Button
            fullWidth
            onPress={() => {
              router.push(MOBILE_PATHS.auth);
            }}
          >
            인증하러 가기
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  async function handlePressChat(targetUserId: string) {
    setPendingChatUserId(targetUserId);

    try {
      const response = await ensureDirectChatRoomMutation.mutateAsync({
        targetUserId,
      });

      router.push({
        pathname: MOBILE_PATHS.bikers.chat,
        params: {
          chatId: response.data.room.id,
        },
      } as unknown as Href);
    } catch (error) {
      Alert.alert(
        "채팅방을 열 수 없습니다",
        error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요."
      );
    } finally {
      setPendingChatUserId((currentValue) =>
        currentValue === targetUserId ? null : currentValue
      );
    }
  }

  return (
    <View className="bg-bg flex-1">
      <MapCanvasWebView
        activeFilter="all"
        bikerPresences={nearbyBikers}
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
          value={isSharingEnabled}
          onValueChange={(nextValue) => {
            void toggleSharing(nextValue);
          }}
          label={isSharingEnabled ? "위치 공유중" : "위치 공유 끔"}
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

          {isSyncing ? (
            <AppText className="text-xs font-bold text-muted">
              주변 바이커 정보를 동기화하는 중입니다
            </AppText>
          ) : null}

          {errorMessage ? (
            <View className="gap-2">
              <AppText className="text-xs font-bold text-warning">
                {errorMessage}
              </AppText>
            </View>
          ) : null}

          {liveBikersErrorMessage ? (
            <View className="gap-2">
              <AppText className="text-xs font-bold text-warning">
                {liveBikersErrorMessage}
              </AppText>
            </View>
          ) : null}

          <AppText className="text-xs font-bold text-text">
            주변 바이커 {nearbyBikers.length}명
          </AppText>
        </View>
      </SafeAreaView>
      <BikersBottomSheet
        bikers={nearbyBikers.map((biker) => ({
          userId: biker.userId,
          nickname: biker.nickname,
          bikeBrand: biker.bikeBrand ?? "바이크 정보 없음",
          bikeModel: biker.bikeModel ?? "모델 정보 없음",
          distance: formatDistanceKm(
            currentLocation?.lat ?? null,
            currentLocation?.lng ?? null,
            biker.location.lat,
            biker.location.lng
          ),
          proficiency: "미정",
        }))}
        onPressChat={(biker) => {
          void handlePressChat(biker.userId);
        }}
        pendingChatUserId={pendingChatUserId}
      />
    </View>
  );
}

function formatDistanceKm(
  fromLat: number | null,
  fromLng: number | null,
  toLat: number,
  toLng: number
) {
  if (fromLat === null || fromLng === null) {
    return "-";
  }

  const distanceMeters = calculateDistanceMeters(
    fromLat,
    fromLng,
    toLat,
    toLng
  );
  return (distanceMeters / 1000).toFixed(distanceMeters >= 1000 ? 1 : 2);
}

function calculateDistanceMeters(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
) {
  const earthRadiusMeters = 6371000;
  const lat1 = degreesToRadians(fromLat);
  const lat2 = degreesToRadians(toLat);
  const deltaLat = degreesToRadians(toLat - fromLat);
  const deltaLng = degreesToRadians(toLng - fromLng);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return (
    2 *
    earthRadiusMeters *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
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
