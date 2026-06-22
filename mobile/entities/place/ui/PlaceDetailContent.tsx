import {
  AppText,
  Button,
  Chip,
  DefaultCardContainer,
} from "@/components/common";
import { Divider, openExternalUrl } from "@/shared";
import { Feather, Ionicons } from "@expo/vector-icons";
import {
  bikerMapTheme,
  placeCategoryOptions,
  type PlaceDetail,
} from "@package-shared/index";
import { Image, View } from "react-native";

export function PlaceDetailContent({ place }: { place: PlaceDetail }) {
  const label = placeCategoryOptions.find(
    (option) => option.value === place.category
  )?.label;

  return (
    <View className="flex h-full flex-col gap-5">
      {place.images && place.images.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {place.images.map((image) => (
            <View key={image} style={{ width: "48%" }}>
              <Image
                source={{ uri: image }}
                accessibilityLabel={`${place.name} 이미지`}
                className="h-44 w-full rounded-2xl"
                resizeMode="cover"
              />
            </View>
          ))}
        </View>
      ) : null}

      <View className="flex flex-row gap-3">
        {label && <Chip label={label} />}
        <AppText className="text-2xl font-semibold tracking-[-0.04em] text-text">
          {place.name}
        </AppText>
      </View>
      <AppText className="text-sm leading-6 text-muted">
        {place.description ??
          "운영자가 큐레이션한 장소입니다. 네이버 플레이스로 바로 이동할 수 있습니다."}
      </AppText>
      <Divider />

      <DefaultCardContainer containerStyle="grid gap-3 text-sm text-muted">
        <View className="flex flex-row items-start gap-3">
          <Feather
            name="map-pin"
            size={16}
            color={bikerMapTheme.colors.accent}
          />
          <AppText className="whitespace-pre-wrap">{place.address}</AppText>
        </View>
        <View className="flex flex-row items-start gap-3">
          <Feather name="phone" size={24} color={bikerMapTheme.colors.accent} />

          {place.phone ? (
            <AppText className="whitespace-pre-wrap">{place.phone}</AppText>
          ) : (
            <AppText>정보 없음</AppText>
          )}
        </View>
      </DefaultCardContainer>

      <View className="mt-auto">
        <Button
          accessibilityLabel={`${place.name} 길찾기 열기`}
          onPress={() => void openExternalUrl(place.naverPlaceUrl)}
          leftIcon={
            <Ionicons
              name="navigate-outline"
              size={16}
              color={bikerMapTheme.colors.text}
            />
          }
        >
          <AppText className="text-[13px] font-bold">지도 보기</AppText>
        </Button>
      </View>
    </View>
  );
}
