import { type ReactNode, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { bikerMapTheme } from "@package-shared/constants/theme";
import { AntDesign } from "@expo/vector-icons";

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
  sheetStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  title?: string;
  triggerStyle?: PressableProps["style"];
  triggerTextStyle?: StyleProp<TextStyle>;
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
  sheetStyle,
  style,
  title,
  triggerStyle,
  triggerTextStyle,
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
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={[styles.label, errorText ? styles.labelError : null]}>
          {label}
        </Text>
      ) : null}

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
          style={(state) => [
            styles.trigger,
            isVisible ? styles.triggerOpen : null,
            errorText ? styles.triggerError : null,
            disabled ? styles.triggerDisabled : null,
            state.pressed && !disabled ? styles.triggerPressed : null,
            resolvePressableStyle(triggerStyle, state),
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.triggerText,
              selectedOption ? null : styles.placeholder,
              triggerTextStyle,
            ]}
          >
            {selectedOption?.label ?? placeholder}
          </Text>
          <View
            style={[styles.chevron, isVisible ? styles.chevronOpen : null]}
          />
        </Pressable>
      )}

      {message ? (
        <Text style={[styles.message, errorText ? styles.messageError : null]}>
          {message}
        </Text>
      ) : null}

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
          style={styles.backdrop}
        >
          <View />
        </Pressable>

        <View
          pointerEvents="box-none"
          style={[
            styles.sheetWrap,
            { paddingBottom: Math.max(insets.bottom, 14) },
          ]}
        >
          <View style={[styles.sheet, sheetStyle]}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text numberOfLines={1} style={styles.sheetTitle}>
                {sheetTitle}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setMenuVisible(false)}
                style={styles.closeButton}
              >
                <AntDesign name="close" size={16} color="gray" />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.optionList}
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
                      style={(state) => [
                        styles.option,
                        isSelected ? styles.optionSelected : null,
                        isDanger ? styles.optionDanger : null,
                        option.disabled ? styles.optionDisabled : null,
                        state.pressed && !option.disabled
                          ? styles.optionPressed
                          : null,
                      ]}
                    >
                      <View style={styles.optionCopy}>
                        <Text
                          style={[
                            styles.optionLabel,
                            isDanger ? styles.optionLabelDanger : null,
                          ]}
                        >
                          {option.label}
                        </Text>
                        {option.description ? (
                          <Text style={styles.optionDescription}>
                            {option.description}
                          </Text>
                        ) : null}
                      </View>

                      {isSelected ? <View style={styles.selectedDot} /> : null}
                    </Pressable>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>{emptyText}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function resolvePressableStyle(
  style: PressableProps["style"] | undefined,
  state: PressableStateCallbackType
) {
  return typeof style === "function" ? style(state) : style;
}

const styles = StyleSheet.create({
  container: {
    gap: 7,
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
  trigger: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 48,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panelSolid,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  triggerOpen: {
    borderColor: bikerMapTheme.colors.accent,
    backgroundColor: bikerMapTheme.colors.panelSoft,
  },
  triggerError: {
    borderColor: bikerMapTheme.colors.danger,
    backgroundColor: "rgba(216, 91, 78, 0.1)",
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerPressed: {
    transform: [{ translateY: 1 }],
  },
  triggerText: {
    flex: 1,
    color: bikerMapTheme.colors.text,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  placeholder: {
    color: bikerMapTheme.colors.muted,
  },
  chevron: {
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: bikerMapTheme.colors.muted,
    transform: [{ rotate: "45deg" }],
  },
  chevronOpen: {
    borderColor: bikerMapTheme.colors.accent,
    transform: [{ rotate: "225deg" }],
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3, 6, 11, 0.64)",
  },
  sheetWrap: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 14,
  },
  sheet: {
    maxHeight: "78%",
    gap: 12,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panel,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  handle: {
    alignSelf: "center",
    width: 54,
    height: 5,
    borderRadius: 999,
    backgroundColor: bikerMapTheme.colors.panelSoft,
  },
  sheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  sheetTitle: {
    flex: 1,
    color: bikerMapTheme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
  },
  closeButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  optionList: {
    gap: 8,
    paddingBottom: 2,
  },
  option: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: bikerMapTheme.colors.panelSolid,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionSelected: {
    borderColor: bikerMapTheme.colors.accent,
    backgroundColor: bikerMapTheme.colors.panelSoft,
  },
  optionDanger: {
    borderColor: "rgba(216, 91, 78, 0.22)",
  },
  optionDisabled: {
    opacity: 0.45,
  },
  optionPressed: {
    backgroundColor: bikerMapTheme.colors.panelSoft,
  },
  optionCopy: {
    flex: 1,
    gap: 4,
  },
  optionLabel: {
    color: bikerMapTheme.colors.text,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20,
  },
  optionLabelDanger: {
    color: bikerMapTheme.colors.danger,
  },
  optionDescription: {
    color: bikerMapTheme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: bikerMapTheme.colors.accent,
  },
  emptyState: {
    minHeight: 72,
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panelSolid,
    paddingHorizontal: 14,
  },
  emptyText: {
    color: bikerMapTheme.colors.muted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "center",
  },
});
