import { Redirect } from "expo-router";

import { useSession } from "../features/session/model";
import { MOBILE_PATHS } from "@/shared/constants/paths";

export default function RootIndex() {
  const { status } = useSession();

  if (status === "loading") {
    return null;
  }

  return <Redirect href={MOBILE_PATHS.map} />;
}
