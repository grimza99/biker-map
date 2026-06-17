import { View } from "react-native";

import {
  AppText,
  Button,
  Chip,
  DefaultCardContainer,
} from "@/components/common";
import { IBiker } from "@package-shared/types";
import { Href, useRouter } from "expo-router";
import { MOBILE_PATHS } from "@/shared";

interface BikerCardProps {
  biker: IBiker;
}
export function BikerCard({ biker }: BikerCardProps) {
  const router = useRouter();
  const chatId = new Date();

  const handleClickBiker = () => {
    router.push({
      pathname: MOBILE_PATHS.bikers.chat,
      params: { chatId: chatId },
    } as unknown as Href);
  };

  return (
    <DefaultCardContainer containerStyle="flex flex-row gap-2">
      <View accessibilityRole="button" className="gap-2 flex-1">
        <AppText className="font-extrabold">{biker.nickname}</AppText>

        <View className="flex-row flex-wrap items-center gap-2">
          <AppText
            className="text-[13px] leading-5"
            tone="muted"
            numberOfLines={2}
          >
            {biker.bikeBrand}
          </AppText>
          <AppText>·</AppText>
          <AppText
            className="text-[13px] leading-5"
            tone="muted"
            numberOfLines={2}
          >
            {biker.bikeModel}
          </AppText>
        </View>
        <View className="flex-row flex-wrap items-center gap-2">
          <Chip label={biker.proficiency} />
          <AppText
            className="text-[13px] leading-5"
            tone="muted"
            numberOfLines={2}
          >
            {biker.distance} km 주변
          </AppText>
        </View>
      </View>

      <Button
        accessibilityLabel={`${biker.nickname}카드 클릭`}
        onPress={handleClickBiker}
        style={{ height: 30 }}
      >
        <AppText className="text-[13px] font-bold text-text">
          라이딩 하기
        </AppText>
      </Button>
    </DefaultCardContainer>
  );
}
