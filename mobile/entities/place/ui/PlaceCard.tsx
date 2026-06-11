import { Ionicons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { bikerMapTheme, PlaceListItem } from "@package-shared/index";

import {
  AppText,
  Button,
  Chip,
  DefaultCardContainer,
} from "@/components/common";

import { openExternalUrl } from "@/shared";

type PlaceCardProps = {
  place: PlaceListItem;
};

export function PlaceCard({ place }: PlaceCardProps) {
  const router = useRouter();
  const handlePressDetail = () => {
    router.push({
      pathname: "/(tabs)/map/places/[placeId]",
      params: { placeId: place.id },
    } as unknown as Href);
  };

  return (
    <DefaultCardContainer>
      <Pressable
        accessibilityLabel={`${place.name} 상세페이지 이동`}
        accessibilityRole="button"
        className="flex-row items-start justify-between gap-3"
        onPress={handlePressDetail}
      >
        <View className="flex-1 gap-1.5">
          <AppText className="font-extrabold">{place.name}</AppText>
          <AppText className="text-[13px] leading-4.5" tone="muted">
            {place.address}
          </AppText>
        </View>
        <Chip label={place.category} />
      </Pressable>
      <View className="flex flex-row gap-2">
        <Button
          accessibilityLabel={`${place.name} 상세페이지 이동`}
          variant="secondary"
          onPress={handlePressDetail}
        >
          <AppText className="text-[13px] font-bold">자세히 보기</AppText>
        </Button>
        <Button
          accessibilityLabel={`${place.name} 길찾기 열기`}
          variant="secondary"
          onPress={() => void openExternalUrl(place.naverPlaceUrl)}
          leftIcon={
            <Ionicons
              name="navigate-outline"
              size={16}
              color={bikerMapTheme.colors.text}
            />
          }
        >
          <AppText className="text-[13px] font-bold">길찾기</AppText>
        </Button>
      </View>
    </DefaultCardContainer>
  );
}
