import { useEffect, useMemo, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  Animated,
  Easing,
  type LayoutChangeEvent,
  StyleSheet,
  type StyleProp,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { cn } from "@/shared";

export type SkeletonBlockProps = Omit<ViewProps, "style"> & {
  className?: string;
  duration?: number;
  shimmerWidth?: number;
  style?: StyleProp<ViewStyle>;
};

export function SkeletonBlock({
  accessibilityElementsHidden = true,
  className,
  duration = 4000,
  importantForAccessibility = "no-hide-descendants",
  shimmerWidth = 300,
  style,
  ...props
}: SkeletonBlockProps) {
  const { onLayout, ...restProps } = props;
  const progress = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(0);
  const AnimatedLinearGradient = useMemo(
    () => Animated.createAnimatedComponent(LinearGradient),
    []
  );

  useEffect(() => {
    if (width < 1) {
      return;
    }

    progress.setValue(0);

    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
      progress.stopAnimation();
    };
  }, [duration, progress, width]);

  const translateX = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [-shimmerWidth, width + shimmerWidth],
      }),
    [progress, shimmerWidth, width]
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;

    if (nextWidth !== width) {
      setWidth(nextWidth);
    }

    onLayout?.(event);
  };

  return (
    <View
      accessibilityElementsHidden={accessibilityElementsHidden}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-border",
        className
      )}
      importantForAccessibility={importantForAccessibility}
      onLayout={handleLayout}
      style={style}
      {...restProps}
    >
      <AnimatedLinearGradient
        colors={SHIMMER_COLORS}
        locations={SHIMMER_LOCATIONS}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        pointerEvents="none"
        style={[
          styles.shimmerTrack,
          {
            width: shimmerWidth,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
}

const SHIMMER_COLORS = [
  "rgba(245,247,250,0.005)",
  "rgba(245,247,250,0.06)",
  "rgba(245,247,250,0.15)",
  "rgba(245,247,250,0.06)",
  "rgba(245,247,250,0.005)",
] as const;

const SHIMMER_LOCATIONS = [0, 0.2, 0.5, 0.8, 1] as const;

const styles = StyleSheet.create({
  shimmerTrack: {
    ...StyleSheet.absoluteFill,
    bottom: 0,
    top: 0,
  },
});
