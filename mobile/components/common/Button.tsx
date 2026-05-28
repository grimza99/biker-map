import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type {
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";

import { bikerMapTheme } from "@package-shared/constants/theme";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "underline";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export type ButtonProps = Omit<
  PressableProps,
  "children" | "disabled" | "style"
> & {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  loading?: boolean;
  rightIcon?: ReactNode;
  selected?: boolean;
  size?: ButtonSize;
  style?: PressableProps["style"];
  textStyle?: StyleProp<TextStyle>;
  variant?: ButtonVariant;
};

const indicatorColorMap: Record<ButtonVariant, string> = {
  primary: bikerMapTheme.colors.text,
  secondary: bikerMapTheme.colors.text,
  ghost: bikerMapTheme.colors.text,
  danger: bikerMapTheme.colors.text,
  underline: bikerMapTheme.colors.accent,
};

export function Button({
  accessibilityState,
  children,
  contentStyle,
  disabled = false,
  fullWidth = false,
  hitSlop,
  leftIcon,
  loading = false,
  rightIcon,
  selected = false,
  size = "md",
  style,
  textStyle,
  variant = "primary",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        ...accessibilityState,
        busy: loading || accessibilityState?.busy,
        disabled: isDisabled || accessibilityState?.disabled,
        selected: selected || accessibilityState?.selected,
      }}
      disabled={isDisabled}
      hitSlop={hitSlop ?? 4}
      style={(state) => [
        styles.base,
        variantStyleMap[variant],
        selected ? selectedVariantStyleMap[variant] : null,
        sizeStyleMap[size],
        fullWidth ? styles.fullWidth : null,
        state.pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        resolvePressableStyle(style, state),
      ]}
      {...props}
    >
      <View style={[styles.content, contentStyle]}>
        {loading ? (
          <ActivityIndicator
            color={indicatorColorMap[variant]}
            size="small"
          />
        ) : (
          leftIcon
        )}

        {size === "icon" && loading ? null : (
          <ButtonChildren
            size={size}
            textStyle={textStyle}
            variant={variant}
          >
            {children}
          </ButtonChildren>
        )}

        {loading ? null : rightIcon}
      </View>
    </Pressable>
  );
}

function ButtonChildren({
  children,
  size,
  textStyle,
  variant,
}: {
  children: ReactNode;
  size: ButtonSize;
  textStyle?: StyleProp<TextStyle>;
  variant: ButtonVariant;
}) {
  if (typeof children === "string" || typeof children === "number") {
    return (
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          textSizeStyleMap[size],
          textVariantStyleMap[variant],
          textStyle,
        ]}
      >
        {children}
      </Text>
    );
  }

  return children;
}

function resolvePressableStyle(
  style: PressableProps["style"] | undefined,
  state: PressableStateCallbackType
) {
  return typeof style === "function" ? style(state) : style;
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
    borderRadius: 999,
    borderWidth: 1,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    alignSelf: "stretch",
    width: "100%",
  },
  pressed: {
    transform: [{ translateY: 1 }],
  },
  primary: {
    borderColor: bikerMapTheme.colors.accent,
    backgroundColor: bikerMapTheme.colors.accent,
  },
  secondary: {
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panelSolid,
  },
  ghost: {
    borderColor: "transparent",
    backgroundColor: "transparent",
  },
  danger: {
    borderColor: bikerMapTheme.colors.danger,
    backgroundColor: bikerMapTheme.colors.danger,
  },
  underline: {
    borderColor: "transparent",
    backgroundColor: "transparent",
  },
  primarySelected: {
    borderColor: bikerMapTheme.colors.accentLight,
    backgroundColor: bikerMapTheme.colors.accentLight,
  },
  secondarySelected: {
    borderColor: bikerMapTheme.colors.accent,
    backgroundColor: bikerMapTheme.colors.panelSoft,
  },
  ghostSelected: {
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panelSoft,
  },
  dangerSelected: {
    borderColor: bikerMapTheme.colors.danger,
    backgroundColor: bikerMapTheme.colors.danger,
  },
  underlineSelected: {
    borderColor: "transparent",
    backgroundColor: "transparent",
  },
  sm: {
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  md: {
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  lg: {
    minHeight: 52,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  icon: {
    height: 44,
    width: 44,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  label: {
    fontWeight: "800",
  },
  labelSm: {
    fontSize: 13,
    lineHeight: 18,
  },
  labelMd: {
    fontSize: 14,
    lineHeight: 20,
  },
  labelLg: {
    fontSize: 16,
    lineHeight: 22,
  },
  labelIcon: {
    fontSize: 14,
    lineHeight: 18,
  },
  labelOnSolid: {
    color: bikerMapTheme.colors.text,
  },
  labelDefault: {
    color: bikerMapTheme.colors.text,
  },
  labelUnderline: {
    color: bikerMapTheme.colors.accent,
    textDecorationLine: "underline",
  },
});

const variantStyleMap: Record<ButtonVariant, StyleProp<ViewStyle>> = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
  danger: styles.danger,
  underline: styles.underline,
};

const selectedVariantStyleMap: Record<ButtonVariant, StyleProp<ViewStyle>> = {
  primary: styles.primarySelected,
  secondary: styles.secondarySelected,
  ghost: styles.ghostSelected,
  danger: styles.dangerSelected,
  underline: styles.underlineSelected,
};

const sizeStyleMap: Record<ButtonSize, StyleProp<ViewStyle>> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  icon: styles.icon,
};

const textSizeStyleMap: Record<ButtonSize, StyleProp<TextStyle>> = {
  sm: styles.labelSm,
  md: styles.labelMd,
  lg: styles.labelLg,
  icon: styles.labelIcon,
};

const textVariantStyleMap: Record<ButtonVariant, StyleProp<TextStyle>> = {
  primary: styles.labelOnSolid,
  secondary: styles.labelDefault,
  ghost: styles.labelDefault,
  danger: styles.labelOnSolid,
  underline: styles.labelUnderline,
};
