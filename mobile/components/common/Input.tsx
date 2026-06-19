import { forwardRef, type ReactNode, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import type {
  StyleProp,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from "react-native";

import { bikerMapTheme } from "@package-shared/constants/theme";

import {
  FieldShell,
  fieldSizeStyleMap,
  type FieldBaseProps,
  type FieldSize,
} from "./FieldShell";

export type InputSize = FieldSize;

export type InputProps = Omit<TextInputProps, "editable" | "style"> &
  FieldBaseProps & {
    disabled?: boolean;
    editable?: TextInputProps["editable"];
    fieldStyle?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
  };

type TextInputFocusEvent = Parameters<
  NonNullable<TextInputProps["onFocus"]>
>[0];
type TextInputBlurEvent = Parameters<NonNullable<TextInputProps["onBlur"]>>[0];

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    accessibilityState,
    accessibilityLabel,
    disabled = false,
    editable = true,
    errorText,
    fieldStyle,
    helperText,
    inputStyle,
    label,
    leftIcon,
    multiline = false,
    onBlur,
    onFocus,
    placeholder,
    placeholderTextColor,
    rightIcon,
    selectionColor,
    size = "md",
    style,
    ...props
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const isEditable = editable && !disabled;

  function handleFocus(event: TextInputFocusEvent) {
    setFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event: TextInputBlurEvent) {
    setFocused(false);
    onBlur?.(event);
  }

  return (
    <FieldShell
      disabled={disabled}
      errorText={errorText}
      helperText={helperText}
      label={label}
      size={size}
      style={style}
    >
      <View
        style={[
          styles.field,
          fieldSizeStyleMap[size],
          focused ? styles.fieldFocused : null,
          errorText ? styles.fieldError : null,
          multiline ? styles.fieldMultiline : null,
          fieldStyle,
        ]}
      >
        {leftIcon && <View style={styles.icon}>{leftIcon}</View>}

        <TextInput
          accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
          accessibilityState={{
            ...accessibilityState,
            disabled: disabled || accessibilityState?.disabled,
          }}
          editable={isEditable}
          multiline={multiline}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          placeholderTextColor={
            placeholderTextColor ?? bikerMapTheme.colors.muted
          }
          ref={ref}
          selectionColor={selectionColor ?? bikerMapTheme.colors.accent}
          style={[
            styles.input,
            multiline ? styles.inputMultiline : null,
            inputStyle,
          ]}
          {...props}
        />

        {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
      </View>
    </FieldShell>
  );
});

const styles = StyleSheet.create({
  field: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panelSolid,
  },
  fieldFocused: {
    borderColor: bikerMapTheme.colors.accent,
    backgroundColor: bikerMapTheme.colors.panelSoft,
  },
  fieldError: {
    borderColor: bikerMapTheme.colors.danger,
    backgroundColor: "rgba(216, 91, 78, 0.1)",
  },
  fieldMultiline: {
    alignItems: "flex-start",
    minHeight: 112,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 24,
    minWidth: 24,
  },
  input: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    color: bikerMapTheme.colors.text,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  inputMultiline: {
    minHeight: 84,
    textAlignVertical: "top",
  },
});
