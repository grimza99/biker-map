import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

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
  onPressDetail?: (place: PlaceListItem) => void;
};

export function PlaceCard({ place, onPressDetail }: PlaceCardProps) {
  return (
    <DefaultCardContainer>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1.5">
          <AppText className="font-extrabold">{place.name}</AppText>
          <AppText className="text-[13px] leading-4.5" tone="muted">
            {place.address}
          </AppText>
        </View>
        <Chip label={place.category} />
      </View>
      <View className="flex flex-row gap-2">
        {onPressDetail ? (
          <Button
            accessibilityLabel={`${place.name} 상세페이지 이동`}
            variant="secondary"
            onPress={() => onPressDetail(place)}
          >
            <AppText className="text-[13px] font-bold">상세보기</AppText>
          </Button>
        ) : null}
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
