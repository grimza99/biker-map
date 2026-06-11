import { Ionicons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import {
  bikerMapTheme,
  regionLabel,
  RouteListItem,
} from "@package-shared/index";

import {
  AppText,
  Button,
  Chip,
  DefaultCardContainer,
} from "@/components/common";
import { RouteMetaRow } from "./RouteMetaRow";

export function RouteCard({ route }: { route: RouteListItem }) {
  const router = useRouter();

  const handlePressDetail = () => {
    router.push({
      pathname: "/(tabs)/map/routes/[routeId]",
      params: { routeId: route.id },
    } as unknown as Href);
  };

  return (
    <DefaultCardContainer>
      <Pressable
        accessibilityLabel={`${route.title} 상세페이지 이동`}
        accessibilityRole="button"
        className="gap-2"
        onPress={handlePressDetail}
      >
        <View className="flex-row flex-wrap items-center gap-2">
          <Chip label="큐레이션" />
          {route.tags.map((tag) => (
            <Chip key={`${route.id}-${tag}`} label={`#${tag}`} />
          ))}
        </View>

        <AppText className="font-extrabold">{route.title}</AppText>
        <AppText
          className="text-[13px] leading-5"
          tone="muted"
          numberOfLines={2}
        >
          {route.summary}
        </AppText>
      </Pressable>

      <View className="gap-2 grid grid-cols-2">
        <RouteMetaRow
          icon="map-marker-radius-outline"
          label="출발"
          value={
            route.departureRegion
              ? regionLabel[route.departureRegion]
              : "정보 없음"
          }
        />
        <RouteMetaRow
          icon="map-marker-check-outline"
          label="도착"
          value={
            route.destinationRegion
              ? regionLabel[route.destinationRegion]
              : "정보 없음"
          }
        />
        <RouteMetaRow
          icon="routes"
          label="거리"
          value={route.distanceKm ? `${route.distanceKm}km` : "정보 없음"}
        />
        <RouteMetaRow
          icon="timer-outline"
          label="시간"
          value={
            route.estimatedDurationMinutes
              ? `${route.estimatedDurationMinutes}분`
              : "정보 없음"
          }
        />
      </View>

      <Button
        accessibilityLabel={`${route.title} 상세페이지 이동`}
        onPress={handlePressDetail}
        variant="secondary"
        leftIcon={
          <Ionicons
            name="open-outline"
            size={16}
            color={bikerMapTheme.colors.text}
          />
        }
      >
        <AppText className="text-[13px] font-bold text-text">
          자세히 보기
        </AppText>
      </Button>
    </DefaultCardContainer>
  );
}
