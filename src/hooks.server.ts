import { deleteSessionCookie, getSessionToken, setSessionCookie } from "$lib/server/auth-cookies";
import { getDb } from "$lib/server/context";
import { validateSession } from "$lib/server/services/sessions";
import { type Handle, redirect, type ServerInit } from "@sveltejs/kit";

export const init: ServerInit = () => {
  getDb();
};

const publicPaths = new Set(["/login", "/auth/callback", "/healthz"]);

export const handle: Handle = async ({ event, resolve }) => {
  const token = getSessionToken(event.cookies);
  const auth = token === undefined ? null : await validateSession(getDb(), token);
  if (token !== undefined) {
    if (auth) setSessionCookie(event.cookies, token, auth.session.expiresAt);
    else deleteSessionCookie(event.cookies);
  }
  event.locals.user = auth?.user ?? null;
  event.locals.session = auth?.session ?? null;

  if (!auth && !publicPaths.has(event.url.pathname)) {
    const target =
      event.request.method === "GET" ? event.url.pathname + event.url.search : event.url.pathname;
    redirect(303, `/login?redirectTo=${encodeURIComponent(target)}`);
  }
  return resolve(event);
};
