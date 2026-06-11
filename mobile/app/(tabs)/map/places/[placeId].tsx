import { useLocalSearchParams } from "expo-router";

import { AppText, DefaultCardContainer } from "@/components/common";
import { AppScreen } from "@/components/shell";

export default function PlaceDetailScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();

  return (
    <AppScreen title="장소 상세">
      <DefaultCardContainer>
        <AppText className="text-[13px] leading-5" tone="muted">
          placeId: {placeId}
        </AppText>
      </DefaultCardContainer>
    </AppScreen>
  );
}
