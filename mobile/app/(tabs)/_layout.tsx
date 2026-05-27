import { Redirect, Tabs } from "expo-router";

import { MobileTabBar } from "../../components/shell";
import { useSession } from "../../features/session/model";

export default function TabsLayout() {
  const { status } = useSession();

  if (status !== "authenticated") {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      tabBar={(props) => <MobileTabBar state={props.state} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: "지도",
        }}
      />
      <Tabs.Screen
        name="bikers"
        options={{
          title: "바이커",
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "커뮤니티",
        }}
      />
      <Tabs.Screen
        name="routes"
        options={{
          title: "경로",
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: "내 정보",
        }}
      />
    </Tabs>
  );
}
