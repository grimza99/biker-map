import { type PropsWithChildren } from "react";
import { ScrollView, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/shared";
import { AppText } from "../common";
import { bikerMapTheme } from "@package-shared/constants";

type AppScreenProps = PropsWithChildren<{
  title?: string;
  description?: string;
  containerStyle?: StyleProp<ViewStyle>;
}>;

export function AppScreen({
  title,
  description,
  children,
  containerStyle,
}: AppScreenProps) {
  return (
    <SafeAreaView
      className={cn("flex-1 bg-bg")}
      style={[styles.container, containerStyle]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerClassName="gap-[18px] pb-7"
        showsVerticalScrollIndicator={false}
      >
        {title && (
          <AppText className="text-[34px] font-extrabold leading-10">
            {title}
          </AppText>
        )}
        {description && (
          <AppText className="text-[15px] leading-5.5" tone="muted">
            {description}
          </AppText>
        )}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bikerMapTheme.colors.bg,
    padding: 20,
  },
});
