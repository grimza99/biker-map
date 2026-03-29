import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#d7f4ff",
        tabBarInactiveTintColor: "#8aa0b8",
        tabBarStyle: {
          backgroundColor: "#09111d",
          borderTopColor: "#1b2a3a",
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
