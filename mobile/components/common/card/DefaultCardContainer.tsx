import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { bikerMapTheme } from "@package-shared/constants";

interface IDefaultCardProps {
  containerStyle?: StyleProp<ViewStyle>;
  footerStyle?: StyleProp<ViewStyle>;

  children: ReactNode;
  footer?: ReactNode;
}
export function DefaultCardContainer({
  containerStyle,
  footerStyle,
  children,
  footer,
}: IDefaultCardProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {children}
      {footer && <View style={[styles.footer, footerStyle]}>{footer}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panelSoft,
    shadowColor: bikerMapTheme.shadows.panel,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
