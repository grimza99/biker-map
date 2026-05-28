import { Redirect, Tabs } from "expo-router";

import { MobileTabBar } from "../../components/shell";
import { useSession } from "../../features/session/model";
import { MOBILE_PATHS } from "@/shared/constants/paths";

export default function TabsLayout() {
  const { status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (status !== "authenticated") {
    return <Redirect href={MOBILE_PATHS.auth} />;
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
