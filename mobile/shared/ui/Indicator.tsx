import { bikerMapTheme } from "@package-shared/constants";
import { ActivityIndicator } from "react-native";

type TSize = "large" | "small" | number;
export function Indicator({
  color,
  size = "large",
}: {
  color?: string;
  size?: TSize;
}) {
  const resolveColor = color ? color : bikerMapTheme.colors.accent;
  return <ActivityIndicator color={resolveColor} size={size} />;
}
