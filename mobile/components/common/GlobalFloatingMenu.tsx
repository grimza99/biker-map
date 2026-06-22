import { Ionicons } from "@expo/vector-icons";
import { type ReactNode, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { bikerMapTheme } from "@package-shared/constants/theme";
import { cn } from "@/shared";

import { Button } from "./Button";
import { AppText } from "./AppText";

export type GlobalFloatingMenuOption<T> = {
  description?: string;
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
    <View
      className="absolute bottom-4 right-5 z-50 flex flex-col items-end gap-3"
      pointerEvents="box-none"
      style={{ paddingBottom: Math.max(insets.bottom, 10) }}
    >
      {isOpen && (
        <>
          {options.map((option) => {
            const isDeleteAccount = option.id === "delete-account";

            return (
              <Button
                key={option.id as string}
                accessibilityLabel={triggerAccessibilityLabel}
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
                className={cn(
                  "bg-white rounded-2xl w-36 py-2",
                  isDeleteAccount && "bg-danger"
                )}
                onPress={() => {
                  onSelect(option);

                  if (closeOnSelect) {
                    close();
                  }
                }}
              >
                {option.icon && option.icon}
                <AppText
                  className={cn(
                    "font-extrabold text-black",
                    isDeleteAccount && "text-text"
                  )}
                  numberOfLines={1}
                >
                  {option.label}
                </AppText>
                {option.description && (
                  <AppText
                    className="text-[11px]"
                    numberOfLines={1}
                    tone="muted"
                  >
                    {option.description}
                  </AppText>
                )}
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
          <Ionicons name="reorder-three" size={26} color="white" />
        )}
        {triggerLabel && (
          <AppText className="text-sm font-extrabold">{triggerLabel}</AppText>
        )}
      </Pressable>
    </View>
  );
}
