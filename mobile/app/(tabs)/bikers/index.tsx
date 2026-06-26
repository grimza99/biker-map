import { Alert, Linking, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useEffect, useRef, useState } from "react";

import { AppText, Button } from "@/components/common";
import {
  useEnsureDirectChatRoomMutation,
  useLiveBikers,
} from "@/features/bikers";
import { AuthVerifyDialog } from "@/features/auth/ui";
import { useCurrentLocation } from "@/features/location/hooks";
import { MapCanvasWebView } from "@/features/map/ui/MapCanvasWebView";
import { MOBILE_PATHS, Toggle } from "@/shared";
import { Href, useRouter } from "expo-router";
import { BikersBottomSheet } from "@/entities/bikers/ui/BikersBottomSheet";
import { useSession } from "@/features/session/model";

export default function BikersScreen() {
  const { status, user } = useSession();
  const isAuthenticated = status === "authenticated";
  const isVerified = Boolean(user?.isVerified);
  const canUseLiveBiker = isAuthenticated && isVerified;
  const shouldBlockForVerification = isAuthenticated && !isVerified;
  const router = useRouter();
  const [pendingChatUserId, setPendingChatUserId] = useState<string | null>(
    null
  );
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const hasShownAnonymousAlertRef = useRef(false);
  const {
    currentLocation,
    errorMessage,
    isLoading,
  } = useCurrentLocation(canUseLiveBiker);
  const {
    canRetryRealtime,
    errorMessage: liveBikersErrorMessage,
    isSharingEnabled,
    isRealtimeRetrying,
    isSyncing,
    nearbyBikers,
    realtimeErrorMessage,
    retryRealtime,
    toggleSharing,
  } = useLiveBikers({
    currentLocation,
    enabled: canUseLiveBiker,
  });
  const ensureDirectChatRoomMutation = useEnsureDirectChatRoomMutation();
  const isLocationServiceDisabled =
    errorMessage ===
    "기기의 위치 서비스가 꺼져 있어 현재 위치를 가져올 수 없습니다.";

  useEffect(() => {
    if (status !== "anonymous") {
      hasShownAnonymousAlertRef.current = false;
      return;
    }

    if (hasShownAnonymousAlertRef.current) {
      return;
    }

    hasShownAnonymousAlertRef.current = true;

    Alert.alert(
      "로그인이 필요합니다",
      "Live-biker 기능을 사용하려면 로그인이 필요합니다.",
      [
        {
          text: "확인",
          onPress: () => {
            router.push(MOBILE_PATHS.auth as Href);
          },
        },
      ],
      {
        cancelable: false,
      }
    );
  }, [router, status]);

  useEffect(() => {
    if (!shouldBlockForVerification) {
      setIsVerifyDialogOpen(false);
      return;
    }

    setIsVerifyDialogOpen(true);
  }, [shouldBlockForVerification]);

  useEffect(() => {
    if (!canUseLiveBiker || !isLocationServiceDisabled) {
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
  }, [canUseLiveBiker, isLocationServiceDisabled]);

  if (status === "loading") {
    return null;
  }

  if (status === "anonymous") {
    return (
      <View className="bg-bg flex-1 items-center justify-center px-6">
        <AppText className="text-center text-base font-bold text-text">
          Live-biker는 로그인 후 사용할 수 있습니다.
        </AppText>
      </View>
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
        error instanceof Error
          ? error.message
          : "잠시 후 다시 시도해 주세요."
      );
    } finally {
      setPendingChatUserId((currentValue) =>
        currentValue === targetUserId ? null : currentValue
      );
    }
  }

  return (
    <View className="bg-bg flex-1">
      {shouldBlockForVerification ? (
        <BlockedLiveBikerView
          onPressVerify={() => {
            setIsVerifyDialogOpen(true);
          }}
        />
      ) : (
        <MapCanvasWebView
          activeFilter="all"
          bikerPresences={nearbyBikers}
          currentLocation={currentLocation}
          places={[]}
          routes={[]}
        />
      )}

      <SafeAreaView
        className="px-4.5 pb-3 pt-2"
        edges={["top"]}
        style={styles.overlay}
      >
        {!shouldBlockForVerification ? (
          <Toggle
            value={isSharingEnabled}
            onValueChange={(nextValue) => {
              void toggleSharing(nextValue);
            }}
            label={isSharingEnabled ? "위치 공유중" : "위치 공유 끔"}
            size="lg"
          />
        ) : null}
        <View className="gap-3 rounded-[28px] border border-border bg-[rgba(17,19,21,0.9)] px-4.5 py-4">
          {shouldBlockForVerification ? (
            <>
              <AppText className="text-sm font-bold text-text">
                본인 인증을 완료하면 Live-biker 지도를 열고 주변 바이커를 볼 수 있습니다.
              </AppText>
              <Button
                size="sm"
                variant="secondary"
                onPress={() => {
                  setIsVerifyDialogOpen(true);
                }}
                style={styles.retryButton}
                textStyle={styles.retryButtonLabel}
              >
                본인 인증하기
              </Button>
            </>
          ) : null}

          {!shouldBlockForVerification && currentLocation ? (
            <AppText className="text-xs font-bold text-text">
              LAT {currentLocation.lat.toFixed(5)} / LNG
              {currentLocation.lng.toFixed(5)}
            </AppText>
          ) : null}

          {!shouldBlockForVerification && isLoading ? (
            <AppText className="text-xs font-bold text-muted">
              현재 위치를 확인하는 중입니다
            </AppText>
          ) : null}

          {!shouldBlockForVerification && isSyncing ? (
            <AppText className="text-xs font-bold text-muted">
              주변 바이커 정보를 동기화하는 중입니다
            </AppText>
          ) : null}

          {!shouldBlockForVerification && errorMessage ? (
            <View className="gap-2">
              <AppText className="text-xs font-bold text-warning">
                {errorMessage}
              </AppText>
            </View>
          ) : null}

          {!shouldBlockForVerification && liveBikersErrorMessage ? (
            <View className="gap-2">
              <AppText className="text-xs font-bold text-warning">
                {liveBikersErrorMessage}
              </AppText>
            </View>
          ) : null}

          {!shouldBlockForVerification && isRealtimeRetrying ? (
            <AppText className="text-xs font-bold text-warning">
              실시간 연결을 다시 시도하고 있습니다.
            </AppText>
          ) : null}

          {!shouldBlockForVerification && realtimeErrorMessage ? (
            <View className="gap-2">
              <AppText className="text-xs font-bold text-warning">
                {realtimeErrorMessage}
              </AppText>

              {canRetryRealtime ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => {
                    retryRealtime();
                  }}
                  style={styles.retryButton}
                  textStyle={styles.retryButtonLabel}
                >
                  다시 연결
                </Button>
              ) : null}
            </View>
          ) : null}

          {!shouldBlockForVerification ? (
            <AppText className="text-xs font-bold text-text">
              주변 바이커 {nearbyBikers.length}명
            </AppText>
          ) : null}
        </View>
      </SafeAreaView>
      {!shouldBlockForVerification ? (
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
      ) : null}

      <AuthVerifyDialog
        open={isVerifyDialogOpen}
        onOpenChange={() => {
          setIsVerifyDialogOpen(false);
        }}
        onSuccess={() => {
          setIsVerifyDialogOpen(false);
        }}
      />
    </View>
  );
}

function BlockedLiveBikerView({
  onPressVerify,
}: {
  onPressVerify: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center bg-panel-solid px-6">
      <View className="w-full max-w-[320px] gap-4 rounded-[28px] border border-border bg-[rgba(17,19,21,0.94)] px-5 py-6">
        <AppText className="text-center text-xl font-bold text-text">
          본인 인증이 필요합니다
        </AppText>
        <AppText className="text-center text-sm font-semibold leading-6 text-muted">
          Live-biker의 현재 위치, 주변 바이커, 실시간 공유는 본인 인증 완료 후 사용할 수 있습니다.
        </AppText>
        <Button fullWidth onPress={onPressVerify} variant="secondary">
          본인 인증하기
        </Button>
      </View>
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

  const distanceMeters = calculateDistanceMeters(fromLat, fromLng, toLat, toLng);
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
  retryButton: {
    alignSelf: "flex-start",
  },
  retryButtonLabel: {
    fontSize: 12,
  },
});
