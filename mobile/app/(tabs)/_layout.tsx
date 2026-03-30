import { Redirect, Tabs } from "expo-router";

import { bikerMapTheme } from "@package-shared/constants/theme";
import { useSession } from "../../features/session/model";

export default function TabsLayout() {
  const { status } = useSession();

  if (status !== "authenticated") {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: bikerMapTheme.colors.text,
        tabBarInactiveTintColor: bikerMapTheme.colors.muted,
        tabBarStyle: {
          backgroundColor: bikerMapTheme.colors.panel,
          borderTopColor: bikerMapTheme.colors.border,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "홈", tabBarLabel: "홈" }} />
      <Tabs.Screen name="map" options={{ title: "지도", tabBarLabel: "지도" }} />
      <Tabs.Screen name="community" options={{ title: "커뮤니티", tabBarLabel: "커뮤니티" }} />
      <Tabs.Screen name="me" options={{ title: "내 정보", tabBarLabel: "내 정보" }} />
    </Tabs>
  );
}
