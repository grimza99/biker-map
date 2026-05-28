import { bikerMapTheme } from "@package-shared/constants";
import { StyleSheet } from "react-native";

export const formStyles = StyleSheet.create({
  formContainer: {
    flexDirection: "column",
    gap: 10,
  },
  fieldStyle: {
    backgroundColor: bikerMapTheme.colors.panelSolid,
  },
});
