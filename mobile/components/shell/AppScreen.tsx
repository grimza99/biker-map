import { type PropsWithChildren } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { bikerMapTheme } from "@package-shared/constants/theme";

type AppScreenProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
}>;

export function AppScreen({ eyebrow, title, description, children }: AppScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bikerMapTheme.colors.bg,
  },
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 32,
  },
  hero: {
    gap: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panel,
    padding: 20,
  },
  eyebrow: {
    color: bikerMapTheme.colors.active,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: bikerMapTheme.colors.text,
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40,
  },
  description: {
    color: bikerMapTheme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
});
