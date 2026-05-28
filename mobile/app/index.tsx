import { Redirect } from "expo-router";

import { useSession } from "../features/session/model";
import { MOBILE_PATHS } from "@/shared/constants/paths";

export default function RootIndex() {
  const { status } = useSession();

  return (
    <Redirect
      href={status === "authenticated" ? MOBILE_PATHS.map : MOBILE_PATHS.auth}
    />
  );
}
