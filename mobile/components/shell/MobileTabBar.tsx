import { Ionicons } from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { bikerMapTheme } from "@package-shared/constants/theme";

type TabRoute = {
  key: string;
  href: Href;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
};

const TAB_ROUTES: TabRoute[] = [
  {
    key: "index",
    href: "/(tabs)",
    label: "홈",
    activeIcon: "home",
    inactiveIcon: "home-outline",
  },
  {
    key: "map",
    href: "/(tabs)/map",
    label: "지도",
    activeIcon: "map",
    inactiveIcon: "map-outline",
  },
  {
    key: "community",
    href: "/(tabs)/community",
    label: "커뮤니티",
    activeIcon: "chatbubbles",
    inactiveIcon: "chatbubbles-outline",
  },
  {
    key: "me",
    href: "/(tabs)/me",
    label: "내 정보",
    activeIcon: "person",
    inactiveIcon: "person-outline",
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
    <View style={[styles.safeArea, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.shell}>
        {TAB_ROUTES.map((route) => {
          const isActive = route.key === activeRouteName;
          const iconName = isActive ? route.activeIcon : route.inactiveIcon;

          return (
            <Link key={route.key} href={route.href} asChild>
              <Pressable
                style={[styles.item, isActive && styles.itemActive]}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`${route.label} 탭`}
              >
                <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                  <Ionicons
                    name={iconName}
                    size={20}
                    color={isActive ? bikerMapTheme.colors.bg : bikerMapTheme.colors.muted}
                  />
                </View>
                <Text style={[styles.label, isActive && styles.labelActive]}>{route.label}</Text>
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
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  shell: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
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
  itemActive: {
    backgroundColor: bikerMapTheme.colors.panelSoft,
  },
  iconWrap: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "transparent",
  },
  iconWrapActive: {
    backgroundColor: bikerMapTheme.colors.accent,
  },
  label: {
    color: bikerMapTheme.colors.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  labelActive: {
    color: bikerMapTheme.colors.text,
  },
});
