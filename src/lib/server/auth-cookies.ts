import type { Cookies } from "@sveltejs/kit";

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
    return JSON.parse(value) as LoginState;
  } catch {
    return undefined;
  }
}
