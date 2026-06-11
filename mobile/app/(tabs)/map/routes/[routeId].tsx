import { useLocalSearchParams } from "expo-router";

import { AppText, DefaultCardContainer } from "@/components/common";
import { AppScreen } from "@/components/shell";

export default function RouteDetailPlaceholderScreen() {
  const { routeId } = useLocalSearchParams<{ routeId: string }>();

  return (
    <AppScreen title="경로 상세">
      <DefaultCardContainer>
        <AppText className="text-[13px] leading-5" tone="muted">
          routeId: {routeId}
        </AppText>
      </DefaultCardContainer>
    </AppScreen>
  );
}
