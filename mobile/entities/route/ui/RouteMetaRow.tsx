import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

import { bikerMapTheme } from "@package-shared/constants";

import { AppText } from "@/components/common";
import { cn } from "@/shared";

export function RouteMetaRow({
  icon,
  label,
  value,
  TextClassName,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  TextClassName?: string;
}) {
  return (
    <View className="flex-row items-center gap-2 flex-1">
      <MaterialCommunityIcons
        name={icon}
        size={16}
        color={bikerMapTheme.colors.accent}
      />
      <AppText className={cn("text-[13px]", TextClassName)} tone="muted">
        {label} - {value}
      </AppText>
    </View>
  );
}
