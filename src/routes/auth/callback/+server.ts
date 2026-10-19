import { setSessionCookie, takeLoginCookie } from "$lib/server/auth-cookies";
import { config } from "$lib/server/config";
import { getDb, getOidc, redirectUri } from "$lib/server/context";
import { createSession } from "$lib/server/services/sessions";
import { upsertUserFromClaims } from "$lib/server/services/users";
import { redirect } from "@sveltejs/kit";

import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ cookies, url }) => {
  const login = takeLoginCookie(cookies);
  if (!login) redirect(303, "/login?fehler");

  let claims;
  try {
    claims = await getOidc().finish(new URL(redirectUri + url.search), login);
  } catch (error) {
    console.warn("Login failed", error);
    redirect(303, "/login?fehler");
  }

  const db = getDb();
  const user = await upsertUserFromClaims(db, claims, config.adminEmail);
  if (user.active === 0) redirect(303, "/login?fehler");
  const { token, expiresAt } = await createSession(db, user.id);
  setSessionCookie(cookies, token, expiresAt);
  redirect(303, login.redirectTo);
};
