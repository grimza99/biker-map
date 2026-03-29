import { type PropsWithChildren } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

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
    backgroundColor: "#081120",
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
    borderColor: "#1c334d",
    backgroundColor: "#0e1d31",
    padding: 20,
  },
  eyebrow: {
    color: "#8fb7d7",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: "#f3fbff",
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40,
  },
  description: {
    color: "#b5c6d8",
    fontSize: 15,
    lineHeight: 22,
  },
});
