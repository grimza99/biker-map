import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReactNode } from "react";

import { bikerMapTheme } from "@package-shared/constants/theme";

import { cn } from "@/shared";
import { MOBILE_PATHS } from "@/shared/constants/paths";
import { AppText } from "../common";

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
    href: MOBILE_PATHS.community.entry,
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
    routes: { key: string; name: string }[];
  };
};

export function MobileTabBar({ state }: MobileTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRouteName = state.routes[state.index]?.name ?? "index";

  return (
    <View
      className="bg-bg"
      style={{ paddingBottom: Math.max(insets.bottom, 10) }}
    >
      <View className="min-h-18 flex-row items-center justify-between gap-1.5 bg-panel p-2">
        {TAB_ROUTES.map((route) => {
          const isActive = route.key === activeRouteName;

          return (
            <Link key={route.key} href={route.href} asChild>
              <Pressable
                className="min-h-14 flex-1 items-center justify-center gap-1 rounded-[22px]"
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
                <AppText
                  className={cn(
                    "text-[11px] font-bold",
                    isActive && "text-accent"
                  )}
                >
                  {route.label}
                </AppText>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}
