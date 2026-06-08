import { PressableProps, PressableStateCallbackType } from "react-native";

export function resolvePressableStyle(
  style: PressableProps["style"] | undefined,
  state: PressableStateCallbackType
) {
  return typeof style === "function" ? style(state) : style;
}
