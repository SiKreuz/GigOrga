import { setSessionCookie, takeLoginCookie } from "$lib/server/auth-cookies";
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
  const userId = await upsertUserFromClaims(db, claims);
  const { token, expiresAt } = await createSession(db, userId);
  setSessionCookie(cookies, token, expiresAt);
  redirect(303, login.redirectTo);
};
