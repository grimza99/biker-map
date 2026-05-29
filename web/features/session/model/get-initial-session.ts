import type { InitialSessionData } from "@package-shared/types/session";

import { auth } from "@/auth";

export async function getInitialSession(): Promise<InitialSessionData> {
  const session = await auth();

  return {
    session: session?.appSession ?? null,
    accessToken: session?.accessToken ?? null,
  };
}
