import { bikerMapTheme } from "@package-shared/constants/theme";
import { StyleSheet } from "react-native";

export const containerStyles = StyleSheet.create({
  panel: {
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panelSoft,
    padding: 18,
  },
});
