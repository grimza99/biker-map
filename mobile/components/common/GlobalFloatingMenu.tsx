import { Ionicons } from "@expo/vector-icons";
import { type ReactNode, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { bikerMapTheme } from "@package-shared/constants/theme";

import { Button } from "./Button";

export type GlobalFloatingMenuOption<T> = {
  disabled?: boolean;
  icon?: ReactNode;
  id: T | string;
  label: string;
  rightSlot?: ReactNode;
};

export type GlobalFloatingMenuProps<T> = {
  closeOnSelect?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect: (option: GlobalFloatingMenuOption<T>) => void;
  open?: boolean;
  options: GlobalFloatingMenuOption<T>[];
  triggerAccessibilityLabel?: string;
  triggerIcon?: ReactNode;
  triggerLabel?: string;
};

export function GlobalFloatingMenu<T>({
  closeOnSelect = true,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  open,
  options,
  triggerAccessibilityLabel = "플로팅 메뉴 열기",
  triggerIcon,
  triggerLabel,
}: GlobalFloatingMenuProps<T>) {
  const insets = useSafeAreaInsets();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;

  const setResolvedOpen = (nextOpen: boolean) => {
    if (open === undefined) {
      setUncontrolledOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

  const close = () => setResolvedOpen(false);

  return (
    <>
      <View
        className="absolute -bottom-180 right-5 z-50 items-end flex flex-col gap-3"
        pointerEvents="box-none"
        style={{ paddingBottom: Math.max(insets.bottom, 10) }}
      >
        {isOpen && (
          <>
            {options.map((option) => {
              const isDraw = option.id === "draw";

              return (
                <Button
                  key={option.id as string}
                  accessibilityLabel={triggerAccessibilityLabel}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                  style={[
                    {
                      width: 150,
                      backgroundColor: "#ffffff",
                      borderWidth: 2,
                    },
                    isDraw && styles.drawButton,
                  ]}
                  onPress={() => {
                    onSelect(option);

                    if (closeOnSelect) {
                      close();
                    }
                  }}
                >
                  {option.icon && option.icon}
                  <Text
                    className="font-extrabold text-black"
                    style={[isDraw && styles.drawButtonText]}
                  >
                    {option.label}
                  </Text>
                  {option.rightSlot && option.rightSlot}
                </Button>
              );
            })}
          </>
        )}
        <Pressable
          accessibilityLabel={triggerAccessibilityLabel}
          accessibilityRole="button"
          accessibilityState={{ expanded: isOpen }}
          className="min-h-14 min-w-14 flex-row items-center justify-center gap-2 rounded-full border border-accent bg-accent"
          onPress={() => {
            if (isOpen) setResolvedOpen(false);
            else setResolvedOpen(true);
          }}
        >
          {triggerIcon ?? (
            <Ionicons
              name="reorder-three"
              size={26}
              color={bikerMapTheme.colors.bg}
            />
          )}
          {triggerLabel && (
            <Text className="text-sm font-extrabold text-text ">
              {triggerLabel}
            </Text>
          )}
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  drawButton: {
    backgroundColor: bikerMapTheme.colors.accent,
    opacity: 0.5,
  },
  drawButtonText: {
    color: bikerMapTheme.colors.accentStrong,
  },
});
