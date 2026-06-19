import { type PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";

import { bikerMapTheme } from "@package-shared/constants/theme";

export type FieldSize = "sm" | "md" | "lg";

export type FieldBaseProps = {
  disabled?: boolean;
  errorText?: string;
  helperText?: string;
  label?: string;
  labelStyle?: StyleProp<TextStyle>;
  messageStyle?: StyleProp<TextStyle>;
  size?: FieldSize;
  style?: StyleProp<ViewStyle>;
};

export type FieldMessage = {
  text: string;
  tone: "error" | "helper";
};

export function FieldShell({
  children,
  disabled = false,
  errorText,
  helperText,
  label,
  labelStyle,
  messageStyle,
  style,
}: PropsWithChildren<FieldBaseProps>) {
  const message = resolveFieldMessage(errorText, helperText);

  return (
    <View
      style={[styles.container, disabled ? styles.disabled : null, style]}
    >
      {label && (
        <Text
          style={[
            styles.label,
            errorText ? styles.labelError : null,
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}

      {children}

      {message ? (
        <Text
          style={[
            styles.message,
            message.tone === "error" ? styles.messageError : null,
            messageStyle,
          ]}
        >
          {message.text}
        </Text>
      ) : null}
    </View>
  );
}

export function resolveFieldMessage(
  errorText?: string,
  helperText?: string
): FieldMessage | null {
  if (errorText) {
    return {
      text: errorText,
      tone: "error",
    };
  }

  if (helperText) {
    return {
      text: helperText,
      tone: "helper",
    };
  }

  return null;
}

export const fieldSizeStyleMap: Record<FieldSize, ViewStyle> = {
  sm: {
    minHeight: 44,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  md: {
    minHeight: 48,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  lg: {
    minHeight: 54,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
};

const styles = StyleSheet.create({
  container: {
    gap: 7,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    color: bikerMapTheme.colors.text,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  labelError: {
    color: bikerMapTheme.colors.danger,
  },
  message: {
    color: bikerMapTheme.colors.muted,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
  messageError: {
    color: bikerMapTheme.colors.danger,
  },
});
