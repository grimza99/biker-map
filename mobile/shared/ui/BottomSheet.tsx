import { Ionicons } from "@expo/vector-icons";
import {
  createContext,
  type PropsWithChildren,
  type ReactNode,
  useContext,
  useId,
  useMemo,
  useState,
} from "react";
import {
  Modal,
  Pressable,
  Text,
  View,
  type ModalProps,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { bikerMapTheme } from "@package-shared/constants/theme";
import { cn, resolvePressableStyle } from "@/shared";

type BottomSheetContextValue = {
  close: () => void;
  open: boolean;
  setOpen: (nextOpen: boolean) => void;
  titleId: string;
};

const BottomSheetContext = createContext<BottomSheetContextValue | null>(null);

export type BottomSheetProps = PropsWithChildren<{
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}>;

export type BottomSheetTriggerProps = Omit<
  PressableProps,
  "accessibilityRole" | "children" | "onPress" | "style"
> & {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onPress?: PressableProps["onPress"];
  style?: PressableProps["style"];
};

export type BottomSheetContentProps = PropsWithChildren<{
  animationType?: ModalProps["animationType"];
  bodyClassName?: string;
  bodyStyle?: StyleProp<ViewStyle>;
  closeAccessibilityLabel?: string;
  closeOnBackdropPress?: boolean;
  contentContainerClassName?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  description?: string;
  footer?: ReactNode;
  headerAction?: ReactNode;
  icon?: ReactNode;
  showHandle?: boolean;
  testID?: string;
  title?: string;
}>;

export type BottomSheetCloseProps = Omit<
  PressableProps,
  "accessibilityRole" | "children" | "style"
> & {
  children?: ReactNode;
  className?: string;
  style?: PressableProps["style"];
};

export function BottomSheet({
  children,
  defaultOpen = false,
  onOpenChange,
  open,
}: BottomSheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const titleId = useId();
  const resolvedOpen = open ?? uncontrolledOpen;

  const contextValue = useMemo<BottomSheetContextValue>(
    () => ({
      close() {
        if (open === undefined) {
          setUncontrolledOpen(false);
        }

        onOpenChange?.(false);
      },
      open: resolvedOpen,
      setOpen(nextOpen) {
        if (open === undefined) {
          setUncontrolledOpen(nextOpen);
        }

        onOpenChange?.(nextOpen);
      },
      titleId,
    }),
    [onOpenChange, open, resolvedOpen, titleId]
  );

  return (
    <BottomSheetContext.Provider value={contextValue}>
      {children}
    </BottomSheetContext.Provider>
  );
}

export function BottomSheetTrigger({
  accessibilityLabel = "바텀시트 열기",
  accessibilityState,
  children,
  className,
  disabled = false,
  onPress,
  style,
  ...props
}: BottomSheetTriggerProps) {
  const context = useBottomSheetContext("BottomSheetTrigger");

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{
        ...accessibilityState,
        disabled: disabled || accessibilityState?.disabled,
        expanded: context.open,
      }}
      disabled={disabled}
      onPress={(event) => {
        onPress?.(event);

        if (!disabled) {
          context.setOpen(true);
        }
      }}
      className={cn(disabled && "opacity-50", className)}
      style={(state) => [
        state.pressed && !disabled ? pressedStyle : null,
        resolvePressableStyle(style, state),
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
}

export function BottomSheetContent({
  animationType = "slide",
  bodyClassName,
  bodyStyle,
  children,
  closeAccessibilityLabel = "바텀시트 닫기",
  closeOnBackdropPress = true,
  contentContainerClassName,
  contentContainerStyle,
  description,
  footer,
  headerAction,
  icon,
  showHandle = true,
  testID,
  title,
}: BottomSheetContentProps) {
  const context = useBottomSheetContext("BottomSheetContent");
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType={animationType}
      onRequestClose={context.close}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={context.open}
    >
      <View className="flex-1" testID={testID}>
        {/* bottomsheet close 버튼 */}
        <Pressable
          accessibilityLabel={closeAccessibilityLabel}
          accessibilityRole="button"
          onPress={closeOnBackdropPress ? context.close : undefined}
          className="absolute inset-0 bg-bg/70"
        />
        <View
          pointerEvents="box-none"
          className="flex-1 justify-end px-3.5"
          style={[
            {
              paddingBottom: Math.max(insets.bottom, 14),
              paddingTop: Math.max(insets.top, 14),
            },
          ]}
        >
          <View
            accessibilityLabel={`${title} 바텀시트`}
            accessibilityViewIsModal
            className={cn(
              "w-full max-h-[86%] gap-3 rounded-[28px] border border-border bg-panel px-4.5 pb-4.5 pt-3",
              contentContainerClassName
            )}
            style={contentContainerStyle}
          >
            {showHandle && (
              <View className="h-1.25 w-13.5 self-center rounded-full bg-panel-soft" />
            )}
            {/* sheet icon, title, close button 영역 */}
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1 flex-row items-center gap-3">
                {icon && (
                  <View className="h-9 w-9 items-center justify-center rounded-xl border border-border bg-panel-solid">
                    {icon}
                  </View>
                )}
                <Text
                  accessibilityRole="header"
                  className="flex-1 text-[22px] font-extrabold leading-6.75 text-text"
                  nativeID={context.titleId}
                  numberOfLines={2}
                >
                  {title}
                </Text>
              </View>

              <View className="shrink-0 flex-row items-center gap-2">
                {headerAction ? (
                  <View className="shrink-0">{headerAction}</View>
                ) : null}
                <BottomSheetClose
                  accessibilityLabel={closeAccessibilityLabel}
                  className="h-10 w-10 items-center justify-center rounded-[14px] border border-border bg-panel-solid"
                  hitSlop={6}
                />
              </View>
            </View>

            {description ? (
              <Text className="text-[13px] leading-4.5 text-muted">
                {description}
              </Text>
            ) : null}

            <View className={cn("min-h-0", bodyClassName)} style={bodyStyle}>
              {children}
            </View>

            {footer ? <View className="gap-2.5">{footer}</View> : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function BottomSheetClose({
  accessibilityLabel = "바텀시트 닫기",
  children,
  className,
  onPress,
  style,
  ...props
}: BottomSheetCloseProps) {
  const context = useBottomSheetContext("BottomSheetClose");

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={(event) => {
        onPress?.(event);
        context.close();
      }}
      className={className}
      style={(state) => [
        state.pressed ? pressedStyle : null,
        resolvePressableStyle(style, state),
      ]}
      {...props}
    >
      {children ?? (
        <Ionicons name="close" size={18} color={bikerMapTheme.colors.text} />
      )}
    </Pressable>
  );
}

function useBottomSheetContext(componentName: string) {
  const context = useContext(BottomSheetContext);

  if (!context) {
    throw new Error(`${componentName} must be used within BottomSheet`);
  }

  return context;
}

const pressedStyle = {
  transform: [{ translateY: 1 }],
};
