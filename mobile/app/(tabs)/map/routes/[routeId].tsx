import { useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";

import { AppText, Button, Chip } from "@/components/common";
import { AppScreen } from "@/components/shell";
import { RouteMetaRow, useRouteDetailQuery } from "@/entities/route";
import { MarkdownContentNative } from "@/shared/lib/markdown";
import { openExternalUrl } from "@/shared";
import { FavoriteActionButton, useToggleFavorite } from "@/features/favorite";

export default function RouteDetailPlaceholderScreen() {
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const { data } = useRouteDetailQuery(routeId);

  const { mutateAsync: toggleFavorite } = useToggleFavorite({
    targetType: "route",
    targetId: routeId,
  });
  const route = data?.data;

  return (
    <AppScreen title="경로 상세">
      <ScrollView contentContainerStyle={{ flexDirection: "column", gap: 16 }}>
        <View className="flex flex-row items-start justify-between">
          <View className="flex flex-col gap-3 flex-1">
            <AppText className="text-3xl">{route?.title}</AppText>
            <View className="flex flex-row flex-wrap gap-2">
              {route?.tags.map((tag, idx) => (
                <Chip label={tag} key={`${tag}-${idx}`} />
              ))}
            </View>
          </View>
          <FavoriteActionButton
            selected={route?.favorited}
            onClick={() =>
              toggleFavorite({
                favoriteId: route?.favoriteId,
                favorited: route?.favorited,
              })
            }
          />
        </View>
        <View className="gap-2 flex-col border border-border rounded-2xl bg-panel-soft p-4 flex-1">
          <View className="flex flex-row justify-between ">
            <RouteMetaRow
              icon="map-marker-radius-outline"
              label="출발"
              value={"정보 없음"}
              TextClassName="text-white"
            />
            <RouteMetaRow
              icon="map-marker-check-outline"
              label="도착"
              value={"정보 없음"}
              TextClassName="text-white"
            />
          </View>
          <View className="flex flex-row justify-between flex-1">
            <RouteMetaRow
              icon="routes"
              label="거리"
              value={"정보 없음"}
              TextClassName="text-white"
            />
            <RouteMetaRow
              icon="timer-outline"
              label="시간"
              value={"정보 없음"}
              TextClassName="text-white"
            />
          </View>
        </View>
        <Button onPress={() => openExternalUrl(route?.externalMapUrl ?? "")}>
          네비게이션
        </Button>
        {route?.content && <MarkdownContentNative content={route.content} />}
      </ScrollView>
    </AppScreen>
  );
}
