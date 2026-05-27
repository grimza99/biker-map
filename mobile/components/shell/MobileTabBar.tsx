import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { bikerMapTheme } from "@package-shared/constants/theme";
import { ReactNode } from "react";

type TabRoute = {
  key: string;
  href: Href;
  label: string;
  icon: ({ size, color }: { size: number; color: string }) => ReactNode;
};

const TAB_ROUTES: TabRoute[] = [
  {
    key: "map",
    href: "/(tabs)/map",
    label: "지도",
    icon: ({ size, color }) => (
      <Ionicons name="map" size={size} color={color} />
    ),
  },
  {
    key: "bikers",
    href: "/(tabs)/bikers",
    label: "바이커",
    icon: ({ size, color }) => (
      <MaterialCommunityIcons name="motorbike" size={size} color={color} />
    ),
  },
  {
    key: "community",
    href: "/(tabs)/community",
    label: "커뮤니티",
    icon: ({ size, color }) => (
      <Ionicons name="chatbubbles" size={size} color={color} />
    ),
  },
  {
    key: "routes",
    href: "/(tabs)/routes",
    label: "경로",
    icon: ({ size, color }) => (
      <FontAwesome5 name="route" size={size} color={color} />
    ),
  },
  {
    key: "me",
    href: "/(tabs)/me",
    label: "내 정보",
    icon: ({ size, color }) => (
      <Ionicons name="person" size={size} color={color} />
    ),
  },
];

type MobileTabBarProps = {
  state: {
    index: number;
    routes: Array<{ key: string; name: string }>;
  };
};

export function MobileTabBar({ state }: MobileTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRouteName = state.routes[state.index]?.name ?? "index";

  return (
    <View
      style={[styles.safeArea, { paddingBottom: Math.max(insets.bottom, 10) }]}
    >
      <View style={styles.shell}>
        {TAB_ROUTES.map((route) => {
          const isActive = route.key === activeRouteName;

          return (
            <Link key={route.key} href={route.href} asChild>
              <Pressable
                style={StyleSheet.flatten([styles.item])}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`${route.label} 탭`}
              >
                <View>
                  <route.icon
                    size={20}
                    color={
                      isActive
                        ? bikerMapTheme.colors.accent
                        : bikerMapTheme.colors.muted
                    }
                  />
                </View>
                <Text style={[styles.label, isActive && styles.labelActive]}>
                  {route.label}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: bikerMapTheme.colors.bg,
  },
  shell: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    backgroundColor: bikerMapTheme.colors.panel,
    padding: 8,
  },
  item: {
    flex: 1,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 22,
  },

  label: {
    color: bikerMapTheme.colors.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  labelActive: {
    color: bikerMapTheme.colors.accent,
  },
});
