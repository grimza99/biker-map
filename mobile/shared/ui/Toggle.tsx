import { type ReactNode, useEffect, useRef } from "react";
import { Animated, Easing, Pressable, View } from "react-native";
import type { SwitchProps, ViewStyle } from "react-native";

import { bikerMapTheme } from "@package-shared/constants/theme";

import { cn, resolvePressableStyle } from "@/shared";

import { AppText } from "../../components/common/AppText";

export type ToggleProps = Omit<SwitchProps, "thumbColor" | "trackColor"> & {
  containerClassName?: string;
  disabled?: boolean;
  label?: ReactNode;
  labelClassName?: string;
  onValueChange?: (value: boolean) => void;
  size?: "md" | "lg";
  value: boolean;
};

export function Toggle({
  accessibilityLabel,
  containerClassName,
  disabled = false,
  label,
  labelClassName,
  onValueChange,
  size = "md",
  value,
  testID,
}: ToggleProps) {
  const metrics = size === "lg" ? largeToggleMetrics : mediumToggleMetrics;
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, value]);

  function handlePress() {
    if (disabled) {
      return;
    }

    onValueChange?.(!value);
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{
        checked: value,
        disabled,
      }}
      accessibilityValue={{ text: value ? "켜짐" : "꺼짐" }}
      className={cn(
        "border rounded-2xl px-1 w-fit max-w-40 flex justify-center gap-2 flex-row items-center",
        size === "lg" ? "min-h-14" : "min-h-12 ",
        value ? "border-active bg-active/15" : "border-muted bg-muted/40",
        containerClassName
      )}
      disabled={disabled}
      onPress={handlePress}
      testID={testID}
      style={(state) =>
        resolvePressableStyle(
          [
            disabled ? toggleContainerDisabledStyle : null,
            state.pressed && !disabled ? toggleContainerPressedStyle : null,
          ],
          state
        )
      }
    >
      {typeof label === "string" ? (
        <AppText
          className={cn(
            "font-semibold text-sm w-fit",
            value ? "text-active" : "text-text",
            labelClassName
          )}
        >
          {label}
        </AppText>
      ) : label ? (
        <View className="flex-1">{label}</View>
      ) : (
        <View />
      )}

      <View
        pointerEvents="none"
        className={cn(
          "relative, justify-center overflow-hidden bg-transparent w-fit"
        )}
        style={[
          {
            width: metrics.trackWidth,
            height: metrics.trackHeight,
            borderRadius: metrics.trackHeight / 2,
            opacity: disabled ? 0.65 : 1,
          },
        ]}
      >
        <Animated.View
          style={[
            toggleTrackFillStyle,
            {
              borderRadius: metrics.trackHeight / 2,
              backgroundColor: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  bikerMapTheme.colors.border,
                  bikerMapTheme.colors.active,
                ],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            toggleThumbStyle,
            {
              width: metrics.thumbSize,
              height: metrics.thumbSize,
              borderRadius: metrics.thumbSize / 2,
              top: metrics.topInset,
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [metrics.padding, metrics.maxTranslateX],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

const toggleContainerDisabledStyle: ViewStyle = {
  opacity: 0.5,
};

const toggleContainerPressedStyle: ViewStyle = {
  opacity: 0.85,
};

const toggleTrackFillStyle: ViewStyle = {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const toggleThumbStyle: ViewStyle = {
  position: "absolute",
  backgroundColor: bikerMapTheme.colors.text,
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.18,
  shadowRadius: 8,
  elevation: 3,
};

const mediumToggleMetrics = {
  trackWidth: 54,
  trackHeight: 30,
  thumbSize: 18,
  padding: 4,
  topInset: (30 - 18) / 2,
  maxTranslateX: 54 - 18 - 4,
};

const largeToggleMetrics = {
  trackWidth: 60,
  trackHeight: 36,
  thumbSize: 22,
  padding: 5,
  topInset: (36 - 22) / 2,
  maxTranslateX: 60 - 22 - 5,
};
