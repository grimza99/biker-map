import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator } from "react-native";

import { AppText, DefaultCardContainer } from "@/components/common";
import { AppScreen } from "@/components/shell";
import { PlaceDetailContent, usePlaceDetail } from "@/entities/place";
import { bikerMapTheme } from "@package-shared/index";
import { ScreenState } from "@/shared/ui/ScreenState";

export default function PlaceDetailScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const normalizedPlaceId = placeId ?? "";
  const {
    data: place,
    refetch,
    isError,
    isLoading,
  } = usePlaceDetail(normalizedPlaceId);

  return (
    <AppScreen title={place ? place.name : "장소 상세"}>
      {isLoading ? (
        <DefaultCardContainer containerStyle="items-center rounded-3xl bg-panel py-8">
          <ActivityIndicator color={bikerMapTheme.colors.accent} />
          <AppText tone="muted" className="text-sm">
            장소 정보를 불러오는 중입니다.
          </AppText>
        </DefaultCardContainer>
      ) : isError ? (
        <ScreenState
          title="장소 정보를 불러오지 못했습니다."
          variant="error"
          refetch={refetch}
          description="잠시 후 다시 시도해주세요."
        />
      ) : !place ? (
        <ScreenState
          title="장소를 찾을 수 없습니다."
          variant="not-found"
          description="잘못된 접근이거나 삭제된 장소일 수 있습니다."
        />
      ) : (
        <DefaultCardContainer>
          <PlaceDetailContent place={place} />
        </DefaultCardContainer>
      )}
    </AppScreen>
  );
}
