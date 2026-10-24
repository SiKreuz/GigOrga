import { can, requiredAction } from "$lib/permissions";
import { deleteSessionCookie, getSessionToken, setSessionCookie } from "$lib/server/authCookies";
import { getDb } from "$lib/server/context";
import { validateSession } from "$lib/server/services/sessions";
import { redirect } from "@sveltejs/kit";
import type { Handle, ServerInit } from "@sveltejs/kit";

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
  const action = requiredAction(event.request.method, event.url.pathname);
  if (action && !can(auth?.user.role, action)) {
    return new Response("Keine Berechtigung", { status: 403 });
  }
  return resolve(event);
};
