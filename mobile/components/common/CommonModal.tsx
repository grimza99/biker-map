import { Ionicons } from "@expo/vector-icons";
import { type PropsWithChildren, type ReactNode } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ModalProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { bikerMapTheme } from "@package-shared/constants/theme";

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
      <View style={styles.root} testID={testID}>
        <Pressable
          style={styles.backdrop}
          onPress={closeOnBackdropPress ? onClose : undefined}
          accessibilityRole="button"
          accessibilityLabel="모달 닫기"
        />

        <View
          pointerEvents="box-none"
          style={[
            styles.container,
            variant === "sheet"
              ? [
                  styles.sheetContainer,
                  {
                    paddingTop: Math.max(insets.top, 14),
                    paddingBottom: Math.max(insets.bottom, 14),
                  },
                ]
              : [
                  styles.dialogContainer,
                  {
                    paddingTop: Math.max(insets.top + 24, 32),
                    paddingBottom: Math.max(insets.bottom + 24, 32),
                  },
                ],
          ]}
        >
          <View
            style={[
              styles.surface,
              variant === "sheet" ? styles.sheetSurface : styles.dialogSurface,
              contentContainerStyle,
            ]}
            accessibilityViewIsModal
            accessibilityLabel={`${title} 모달`}
          >
            {shouldShowHandle ? <View style={styles.handle} /> : null}

            <View style={styles.header}>
              <View style={styles.titleBlock}>
                {icon ? <View style={styles.iconBubble}>{icon}</View> : null}
                <View style={styles.titleCopy}>
                  {eyebrow ? (
                    <Text style={styles.eyebrow}>{eyebrow}</Text>
                  ) : null}
                  <Text style={styles.title}>{title}</Text>
                </View>
              </View>

              <View style={styles.headerControls}>
                {headerAction ? (
                  <View style={styles.headerAction}>{headerAction}</View>
                ) : null}
                <Pressable
                  style={styles.closeButton}
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="모달 닫기"
                >
                  <Ionicons name="close" size={18} color={bikerMapTheme.colors.text} />
                </Pressable>
              </View>
            </View>

            {description ? (
              <Text style={styles.description}>{description}</Text>
            ) : null}

            {children ? (
              <View style={[styles.body, bodyStyle]}>{children}</View>
            ) : null}

            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3, 6, 11, 0.68)",
  },
  container: {
    flex: 1,
    paddingHorizontal: 14,
  },
  sheetContainer: {
    justifyContent: "flex-end",
  },
  dialogContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  surface: {
    gap: 12,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panel,
  },
  sheetSurface: {
    width: "100%",
    maxHeight: "86%",
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
  },
  dialogSurface: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    padding: 18,
  },
  handle: {
    alignSelf: "center",
    width: 54,
    height: 5,
    borderRadius: 999,
    backgroundColor: bikerMapTheme.colors.panelSoft,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  titleCopy: {
    flex: 1,
  },
  iconBubble: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: bikerMapTheme.colors.panelSolid,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
  },
  eyebrow: {
    color: bikerMapTheme.colors.active,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  title: {
    color: bikerMapTheme.colors.text,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 27,
    marginTop: 4,
  },
  headerAction: {
    flexShrink: 0,
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  closeButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panelSolid,
  },
  description: {
    color: bikerMapTheme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  body: {
    minHeight: 0,
  },
  footer: {
    gap: 10,
  },
});
