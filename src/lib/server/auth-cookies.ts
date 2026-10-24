import type { Cookies } from "@sveltejs/kit";
import * as v from "valibot";

import type { LoginChecks } from "./oidc";

const sessionCookie = "session";
const loginCookie = "login";

export const getSessionToken = (cookies: Cookies) => cookies.get(sessionCookie);

export function setSessionCookie(cookies: Cookies, token: string, expires: Date) {
  cookies.set(sessionCookie, token, { path: "/", httpOnly: true, sameSite: "lax", expires });
}

export function deleteSessionCookie(cookies: Cookies) {
  cookies.delete(sessionCookie, { path: "/" });
}

export type LoginState = LoginChecks & { redirectTo: string };

const loginState = v.object({
  state: v.string(),
  nonce: v.string(),
  codeVerifier: v.string(),
  redirectTo: v.string(),
});

export function setLoginCookie(cookies: Cookies, state: LoginState) {
  cookies.set(loginCookie, JSON.stringify(state), {
    path: "/auth/callback",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
  });
}

export function takeLoginCookie(cookies: Cookies): LoginState | undefined {
  const value = cookies.get(loginCookie);
  cookies.delete(loginCookie, { path: "/auth/callback" });
  if (value === undefined) return;
  try {
    const parsed = v.safeParse(loginState, JSON.parse(value));
    return parsed.success ? parsed.output : undefined;
  } catch {
    return undefined;
  }
}
