import { Redirect } from "expo-router";

import { useSession } from "../features/session/model";

export default function RootIndex() {
  const { status } = useSession();

  return <Redirect href={status === "authenticated" ? "/(tabs)" : "/(auth)/login"} />;
}
