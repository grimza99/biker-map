import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { bikerMapTheme } from "@package-shared/constants/theme";

import { Button } from "@/components/common";
import { MOBILE_PATHS } from "@/shared/constants/paths";

type AuthRequiredPanelProps = {
  title?: string;
  description: string;
  ctaLabel?: string;
};

export function AuthRequiredPanel({
  title = "로그인이 필요합니다",
  description,
  ctaLabel = "로그인하러 가기",
}: AuthRequiredPanelProps) {
  const router = useRouter();

  return (
    <View style={styles.panel}>
      <View style={styles.copyGroup}>
        <Text style={styles.eyebrow}>Protected feature</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <Button
        fullWidth
        onPress={() => {
          router.push(MOBILE_PATHS.auth);
        }}
      >
        {ctaLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panelSolid,
    padding: 20,
  },
  copyGroup: {
    gap: 8,
  },
  eyebrow: {
    color: bikerMapTheme.colors.active,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  title: {
    color: bikerMapTheme.colors.text,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
  },
  description: {
    color: bikerMapTheme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
});
