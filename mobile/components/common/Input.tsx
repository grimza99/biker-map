import { forwardRef, type ReactNode, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";

import { bikerMapTheme } from "@package-shared/constants/theme";

import { cn } from "@/shared";
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
    fieldClassName?: string;
    inputClassName?: string;
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
    className,
    fieldClassName,
    helperText,
    inputClassName,
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
      className={className}
    >
      <View
        className={cn(
          "flex-row items-center gap-2.5 border border-border bg-panel-solid",
          fieldSizeStyleMap[size],
          focused && "border-accent bg-panel-soft",
          errorText && "border-danger bg-danger/10",
          multiline && "min-h-28 items-start",
          fieldClassName
        )}
      >
        {leftIcon && leftIcon}

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
          className={cn(
            "min-w-0 flex-1 p-0 text-[15px] font-semibold leading-5 text-text",
            multiline && "min-h-21",
            inputClassName
          )}
          style={[multiline && styles.inputMultiline]}
          {...props}
        />

        {rightIcon && rightIcon}
      </View>
    </FieldShell>
  );
});

const styles = StyleSheet.create({
  inputMultiline: {
    textAlignVertical: "top",
  },
});
