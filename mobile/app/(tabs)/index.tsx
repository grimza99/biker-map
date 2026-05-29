import { MOBILE_PATHS } from "@/shared/constants/paths";
import { Redirect } from "expo-router";

export default function TabsIndexRedirect() {
  return <Redirect href={MOBILE_PATHS.map} />;
}
