import { Ionicons } from "@expo/vector-icons";
import { type PropsWithChildren, type ReactNode } from "react";
import {
  Modal,
  Pressable,
  View,
  type ModalProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { bikerMapTheme } from "@package-shared/constants/theme";
import { cn } from "@/shared";
import { AppText } from "./AppText";

export type CommonModalVariant = "sheet" | "dialog";

export type CommonModalProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  description?: string;
  icon?: ReactNode;
  headerAction?: ReactNode;
  footer?: ReactNode;
  variant?: CommonModalVariant;
  animationType?: ModalProps["animationType"];
  showHandle?: boolean;
  closeOnBackdropPress?: boolean;
  bodyClassName?: string;
  contentContainerClassName?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  testID?: string;
}>;

export function CommonModal({
  visible,
  onClose,
  title,
  eyebrow,
  description,
  icon,
  headerAction,
  footer,
  variant = "dialog",
  animationType,
  showHandle,
  closeOnBackdropPress = true,
  bodyClassName,
  contentContainerClassName,
  contentContainerStyle,
  bodyStyle,
  testID,
  children,
}: CommonModalProps) {
  const insets = useSafeAreaInsets();
  const resolvedAnimationType =
    animationType ?? (variant === "sheet" ? "slide" : "fade");
  const shouldShowHandle = showHandle ?? variant === "sheet";

  return (
    <Modal
      visible={visible}
      transparent
      animationType={resolvedAnimationType}
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <View className="flex-1" testID={testID}>
        <Pressable
          className="absolute inset-0 bg-[rgba(3,6,11,0.68)]"
          onPress={closeOnBackdropPress ? onClose : undefined}
          accessibilityRole="button"
          accessibilityLabel="모달 닫기"
        />

        <View
          pointerEvents="box-none"
          className={cn(
            "flex-1 px-3.5",
            variant === "sheet" ? "justify-end" : "items-center justify-center"
          )}
          style={[
            variant === "sheet"
              ? {
                  paddingTop: Math.max(insets.top, 14),
                  paddingBottom: Math.max(insets.bottom, 14),
                }
              : {
                  paddingTop: Math.max(insets.top + 24, 32),
                  paddingBottom: Math.max(insets.bottom + 24, 32),
                },
          ]}
        >
          <View
            className={cn(
              "gap-3 border border-border bg-panel",
              variant === "sheet"
                ? "max-h-[86%] w-full rounded-[28px] px-4.5 pb-4.5 pt-3"
                : "w-full max-w-90 rounded-3xl p-4.5",
              contentContainerClassName
            )}
            style={contentContainerStyle}
            accessibilityViewIsModal
            accessibilityLabel={`${title} 모달`}
          >
            {shouldShowHandle ? (
              <View className="h-1.25 w-13.5 self-center rounded-full bg-panel-soft" />
            ) : null}

            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1 flex-row items-center gap-3">
                {icon ? (
                  <View className="h-9 w-9 items-center justify-center rounded-xl border border-border bg-panel-solid">
                    {icon}
                  </View>
                ) : null}
                <View className="flex-1">
                  {eyebrow ? (
                    <AppText className="text-[11px] uppercase tracking-[1.1px] text-active">
                      {eyebrow}
                    </AppText>
                  ) : null}
                  <AppText className="mt-1 text-[22px] font-extrabold leading-6.75">
                    {title}
                  </AppText>
                </View>
              </View>

              <View className="shrink-0 flex-row items-center gap-2">
                {headerAction ? (
                  <View className="shrink-0">{headerAction}</View>
                ) : null}
                <Pressable
                  className="h-10 w-10 items-center justify-center rounded-[14px] border border-border bg-panel-solid"
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="모달 닫기"
                >
                  <Ionicons
                    name="close"
                    size={18}
                    color={bikerMapTheme.colors.text}
                  />
                </Pressable>
              </View>
            </View>

            {description ? (
              <AppText className="text-[13px] leading-4.5" tone="muted">
                {description}
              </AppText>
            ) : null}

            {children ? (
              <View className={cn("min-h-0", bodyClassName)} style={bodyStyle}>
                {children}
              </View>
            ) : null}

            {footer && <View className="gap-2.5">{footer}</View>}
          </View>
        </View>
      </View>
    </Modal>
  );
}
