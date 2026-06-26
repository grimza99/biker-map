import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

import { bikerMapTheme } from "@package-shared/constants";

type BouncingDotsProps = {
  active?: boolean;
  color?: string;
  size?: number;
};

const DOT_COUNT = 3;
const STAGGER_DELAY_MS = 120;
const BOUNCE_DURATION_MS = 420;

export function BouncingDots({
  active = true,
  color = bikerMapTheme.colors.active,
  size = 6,
}: BouncingDotsProps) {
  const animationsRef = useRef(
    Array.from({ length: DOT_COUNT }, () => new Animated.Value(0.35))
  );

  useEffect(() => {
    const animations = animationsRef.current;
    const loops = active
      ? animations.map((animation, index) =>
          Animated.loop(
            Animated.sequence([
              Animated.delay(index * STAGGER_DELAY_MS),
              Animated.timing(animation, {
                toValue: 1,
                duration: BOUNCE_DURATION_MS,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(animation, {
                toValue: 0.35,
                duration: BOUNCE_DURATION_MS,
                easing: Easing.in(Easing.quad),
                useNativeDriver: true,
              }),
            ])
          )
        )
      : [];

    if (active) {
      loops.forEach((loop) => loop.start());
    } else {
      animations.forEach((animation) => {
        animation.stopAnimation();
        animation.setValue(0.35);
      });
    }

    return () => {
      loops.forEach((loop) => loop.stop());
      animations.forEach((animation) => {
        animation.stopAnimation();
        animation.setValue(0.35);
      });
    };
  }, [active]);

  return (
    <View className="flex-row items-center gap-1">
      {animationsRef.current.map((animation, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: color,
              width: size,
              height: size,
              borderRadius: size / 2,
              opacity: animation,
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0.35, 1],
                    outputRange: [2, -3],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    marginHorizontal: 1,
  },
});
