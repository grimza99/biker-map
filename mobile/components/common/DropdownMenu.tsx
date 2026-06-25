import { type ReactNode, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import type { PressableProps, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";

import { bikerMapTheme } from "@package-shared/constants/theme";

import { cn, resolvePressableStyle } from "@/shared";
import { AppText } from "../../shared/ui/AppText";

export type DropdownOptionTone = "default" | "danger";

export type DropdownOption = {
  description?: string;
  disabled?: boolean;
  label: string;
  onSelect?: () => void;
  tone?: DropdownOptionTone;
  value: string;
};

export type DropdownMenuRenderTriggerProps = {
  disabled: boolean;
  label?: string;
  open: boolean;
  openMenu: () => void;
  placeholder: string;
  selectedOption: DropdownOption | null;
  selectedValue: string;
};

export type DropdownMenuProps = {
  defaultValue?: string;
  defaultVisible?: boolean;
  disabled?: boolean;
  emptyText?: string;
  errorText?: string;
  helperText?: string;
  label?: string;
  onValueChange?: (value: string, option: DropdownOption) => void;
  onVisibleChange?: (visible: boolean) => void;
  options: DropdownOption[];
  placeholder?: string;
  renderTrigger?: (props: DropdownMenuRenderTriggerProps) => ReactNode;
  sheetClassName?: string;
  className?: string;
  title?: string;
  triggerStyle: {
    triggerPressable: PressableProps["style"];
    triggerText: string;
  };
  value?: string;
  visible?: boolean;
};

export function DropdownMenu({
  defaultValue = "",
  defaultVisible = false,
  disabled = false,
  emptyText = "선택 가능한 항목이 없습니다.",
  errorText,
  helperText,
  label,
  onValueChange,
  onVisibleChange,
  options,
  placeholder = "선택하세요",
  renderTrigger,
  sheetClassName,
  className,
  title,
  triggerStyle,
  value,
  visible,
}: DropdownMenuProps) {
  const insets = useSafeAreaInsets();
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [uncontrolledVisible, setUncontrolledVisible] =
    useState(defaultVisible);

  const selectedValue = value ?? uncontrolledValue;
  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue) ?? null,
    [options, selectedValue]
  );
  const isVisible = visible ?? uncontrolledVisible;
  const message = errorText ?? helperText;
  const sheetTitle = title ?? label ?? placeholder;

  function setMenuVisible(nextVisible: boolean) {
    if (visible === undefined) {
      setUncontrolledVisible(nextVisible);
    }

    onVisibleChange?.(nextVisible);
  }

  function handleSelect(option: DropdownOption) {
    if (option.disabled) {
      return;
    }

    if (value === undefined) {
      setUncontrolledValue(option.value);
    }

    option.onSelect?.();
    onValueChange?.(option.value, option);
    setMenuVisible(false);
  }

  const triggerProps: DropdownMenuRenderTriggerProps = {
    disabled,
    label,
    open: isVisible,
    openMenu: () => {
      if (!disabled) {
        setMenuVisible(true);
      }
    },
    placeholder,
    selectedOption,
    selectedValue,
  };

  return (
    <View className={cn("gap-1.75", className)}>
      {label && (
        <AppText
          tone={errorText ? "danger" : "default"}
          className={cn("text-sm font-extrabold")}
        >
          {label}
        </AppText>
      )}

      {renderTrigger ? (
        renderTrigger(triggerProps)
      ) : (
        <Pressable
          accessibilityLabel={label ?? placeholder}
          accessibilityRole="button"
          accessibilityState={{
            disabled,
            expanded: isVisible,
          }}
          disabled={disabled}
          onPress={triggerProps.openMenu}
          className={cn(
            "items-center flex flex-row gap-3 min-h-12 rounded-2xl border border-border bg-panel-solid px-4 py-3",
            isVisible && "border-accent bg-panel-soft",
            errorText && "border-danger bg-[rgba(216, 91, 78, 0.1)]",
            disabled && "opacity-50"
          )}
          style={(state) => [
            state.pressed && !disabled ? triggerPressedStyle : null,
            resolvePressableStyle(triggerStyle.triggerPressable, state),
          ]}
        >
          <AppText
            numberOfLines={1}
            className={cn("flex-1 text-sm font-bold", triggerStyle.triggerText)}
            tone={selectedOption ? "muted" : "default"}
          >
            {selectedOption?.label ?? placeholder}
          </AppText>
          <View
            className={cn(
              "w-2 h-2 border-r-2 border-b-2 border border-muted rotate-45",
              isVisible && "border-accent rotate-225"
            )}
          />
        </Pressable>
      )}

      {message && (
        <AppText
          className={cn("text-xs font-semibold")}
          tone={errorText ? "danger" : "muted"}
        >
          {message}
        </AppText>
      )}

      <Modal
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
        transparent
        visible={isVisible}
      >
        <Pressable
          accessibilityLabel="드롭다운 닫기"
          accessibilityRole="button"
          onPress={() => setMenuVisible(false)}
          className="absolute inset-0 bg-[rgba(3,6,11,0.64)]"
        >
          <View />
        </Pressable>

        <View
          pointerEvents="box-none"
          className={cn("flex-1 justify-end px-3.5")}
          style={[{ paddingBottom: Math.max(insets.bottom, 14) }]}
        >
          <View
            className={cn(
              "max-h-[78%] gap-3 rounded-3xl border border-border bg-panel pt-3 pb-4 px-4",
              sheetClassName
            )}
          >
            <View className="self-center w-13.5 h-1.25 rounded-full bg-panel-soft" />
            <View
              className={cn("items-center flex flex-row justify-between gap-3")}
            >
              <AppText
                numberOfLines={1}
                className="flex-1 text-lg font-extrabold"
              >
                {sheetTitle}
              </AppText>
              <Pressable
                accessibilityRole="button"
                onPress={() => setMenuVisible(false)}
                className="min-h-11 justify-center px-3.5"
              >
                <AntDesign name="close" size={16} color="gray" />
              </Pressable>
            </View>

            <ScrollView
              contentContainerClassName="gap-2 pb-0.5"
              showsVerticalScrollIndicator={false}
            >
              {options.length > 0 ? (
                options.map((option) => {
                  const isSelected = option.value === selectedValue;
                  const isDanger = option.tone === "danger";

                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled: option.disabled,
                        selected: isSelected,
                      }}
                      disabled={option.disabled}
                      key={option.value}
                      onPress={() => handleSelect(option)}
                      className={cn(
                        "min-h-13 flex-row items-center justify-between gap-3 rounded-[18px] border border-transparent bg-panel-solid px-3.5 py-3",
                        isSelected && "border-accent bg-panel-soft",
                        isDanger && "border-danger/22",
                        option.disabled && "opacity-45"
                      )}
                      style={(state) => [
                        state.pressed && !option.disabled
                          ? optionPressedStyle
                          : null,
                      ]}
                    >
                      <View className="flex-1 gap-1">
                        <AppText
                          tone={isDanger ? "danger" : "default"}
                          className="font-extrabold text-sm"
                        >
                          {option.label}
                        </AppText>
                        {option.description && (
                          <AppText tone="muted" className="text-xs">
                            {option.description}
                          </AppText>
                        )}
                      </View>

                      {isSelected && (
                        <View className="w-2.5 h-2.5 rounded-full bg-accent" />
                      )}
                    </Pressable>
                  );
                })
              ) : (
                <View className="min-h-18 justify-center rounded-2xl border border-border bg-panel-solid px-3.5">
                  <AppText
                    tone="muted"
                    className="font-semibold text-center text-sm"
                  >
                    {emptyText}
                  </AppText>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const triggerPressedStyle: ViewStyle = {
  transform: [{ translateY: 1 }],
};

const optionPressedStyle: ViewStyle = {
  backgroundColor: bikerMapTheme.colors.panelSoft,
};
