import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

import { bikerMapTheme } from "@package-shared/constants";

import { AppText } from "@/components/common";

export function RouteMetaRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <MaterialCommunityIcons
        name={icon}
        size={16}
        color={bikerMapTheme.colors.accent}
      />
      <AppText className="text-[13px]" tone="muted">
        {label} - {value}
      </AppText>
    </View>
  );
}
