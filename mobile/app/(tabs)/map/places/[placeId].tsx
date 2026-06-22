import { useLocalSearchParams } from "expo-router";

import { DefaultCardContainer } from "@/components/common";
import { AppScreen } from "@/components/shell";
import { PlaceDetailContent, usePlaceDetail } from "@/entities/place";

export default function PlaceDetailScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const { data: place } = usePlaceDetail(placeId);

  if (!place) return null;
  return (
    <AppScreen title={place.name}>
      <DefaultCardContainer>
        <PlaceDetailContent place={place} />
      </DefaultCardContainer>
    </AppScreen>
  );
}
