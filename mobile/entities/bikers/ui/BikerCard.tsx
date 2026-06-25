import { View } from "react-native";

import {
  AppText,
  Button,
  Chip,
  DefaultCardContainer,
} from "@/components/common";
import type { TBikerPresenceItem } from "@package-shared/index";

export type TBikerCardItem = Pick<
  TBikerPresenceItem,
  "userId" | "nickname" | "bikeBrand" | "bikeModel"
> & {
  distance: string;
  proficiency: string;
};

interface BikerCardProps {
  biker: TBikerCardItem;
  isChatStarting?: boolean;
  onPressChat: (biker: TBikerCardItem) => void;
}

export function BikerCard({
  biker,
  isChatStarting = false,
  onPressChat,
}: BikerCardProps) {

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
        loading={isChatStarting}
        onPress={() => {
          onPressChat(biker);
        }}
        style={{ height: 30 }}
      >
        <AppText className="text-[13px] font-bold text-text">
          라이딩 하기
        </AppText>
      </Button>
    </DefaultCardContainer>
  );
}
