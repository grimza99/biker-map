import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button } from "@/components/common";
import { MOBILE_PATHS } from "@/shared/constants/paths";

type AuthRequiredPanelProps = {
  title?: string;
  description: string;
  ctaLabel?: string;
};

export function AuthRequiredPanel({
  title = "로그인이 필요합니다",
  description,
  ctaLabel = "로그인하러 가기",
}: AuthRequiredPanelProps) {
  const router = useRouter();

  return (
    <View className="gap-4.5 rounded-3xl border border-border bg-panel-solid p-5">
      <View className="gap-2">
        <Text className="text-2xl font-extrabold leading-7.5 text-text">
          {title}
        </Text>
        <Text className="text-[15px] leading-5.5 text-muted">
          {description}
        </Text>
      </View>

      <Button
        fullWidth
        onPress={() => {
          router.push(MOBILE_PATHS.auth);
        }}
      >
        {ctaLabel}
      </Button>
    </View>
  );
}
