import type { LogoutResponseData } from "@package-shared/types/auth";
import { NextResponse } from "next/server";
import { ok } from "@shared/api";
import {
  clearAuthSessionCookies,
  clearRefreshTokenCookie,
} from "@shared/api/auth";

export async function POST() {
  const data: LogoutResponseData = {
    loggedOut: true
  };

  const response = ok(data) as NextResponse;
  clearRefreshTokenCookie(response);
  clearAuthSessionCookies(response);
  return response;
}
