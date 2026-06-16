import { AntDesign } from "@expo/vector-icons";
import { type ReactNode } from "react";
import { Pressable } from "react-native";
import type { PressableProps, ViewStyle } from "react-native";

import { bikerMapTheme } from "@package-shared/constants/theme";

import { cn, resolvePressableStyle } from "@/shared";

import {
  DropdownMenu,
  type DropdownMenuProps,
  type DropdownOption,
} from "../../components/common/DropdownMenu";
import {
  FieldShell,
  fieldSizeStyleMap,
  type FieldBaseProps,
} from "../../components/common/FieldShell";
import { AppText } from "../../components/common/AppText";

export type SelectInputOption = DropdownOption;

export type SelectInputProps = Omit<
  DropdownMenuProps,
  | "className"
  | "errorText"
  | "helperText"
  | "label"
  | "renderTrigger"
  | "triggerStyle"
> &
  FieldBaseProps & {
    fieldClassName?: string;
    leftIcon?: ReactNode;
    placeholderTextClassName?: string;
    rightIcon?: ReactNode;
    triggerPressableStyle?: PressableProps["style"];
    valueTextClassName?: string;
  };

export function SelectInput({
  className,
  defaultVisible = false,
  defaultValue,
  disabled = false,
  emptyText,
  errorText,
  fieldClassName,
  helperText,
  label,
  leftIcon,
  onValueChange,
  onVisibleChange,
  options,
  placeholder = "선택하세요",
  placeholderTextClassName,
  rightIcon,
  sheetClassName,
  size = "md",
  title,
  triggerPressableStyle,
  value,
  valueTextClassName,
  visible,
  ...props
}: SelectInputProps) {
  return (
    <FieldShell
      className={className}
      disabled={disabled}
      errorText={errorText}
      helperText={helperText}
      label={label}
      size={size}
    >
      <DropdownMenu
        defaultValue={defaultValue}
        defaultVisible={defaultVisible}
        disabled={disabled}
        emptyText={emptyText}
        onValueChange={onValueChange}
        onVisibleChange={onVisibleChange}
        options={options}
        placeholder={placeholder}
        renderTrigger={({ open, openMenu, selectedOption }) => (
          <Pressable
            accessibilityLabel={label ?? placeholder}
            accessibilityRole="button"
            accessibilityState={{
              disabled,
              expanded: open,
            }}
            className={cn(
              "flex-row items-center gap-2.5 border border-border bg-panel-solid",
              fieldSizeStyleMap[size],
              open && "border-accent bg-panel-soft",
              errorText && "border-danger bg-danger/10",
              fieldClassName
            )}
            disabled={disabled}
            onPress={openMenu}
            style={(state) => [
              state.pressed && !disabled ? pressedStyle : null,
              resolvePressableStyle(triggerPressableStyle, state),
            ]}
          >
            {leftIcon}

            <AppText
              numberOfLines={1}
              className={cn(
                "min-w-0 flex-1 text-[15px] font-semibold leading-5",
                selectedOption
                  ? cn("text-text", valueTextClassName)
                  : cn("text-muted", placeholderTextClassName)
              )}
            >
              {selectedOption?.label ?? placeholder}
            </AppText>

            {rightIcon ?? (
              <AntDesign
                color={
                  open
                    ? bikerMapTheme.colors.accent
                    : bikerMapTheme.colors.muted
                }
                name={open ? "up" : "down"}
                size={12}
              />
            )}
          </Pressable>
        )}
        sheetClassName={sheetClassName}
        title={title}
        triggerStyle={{
          triggerPressable: undefined,
          triggerText: "",
        }}
        value={value}
        visible={visible}
        {...props}
      />
    </FieldShell>
  );
}

const pressedStyle: ViewStyle = {
  transform: [{ translateY: 1 }],
};
