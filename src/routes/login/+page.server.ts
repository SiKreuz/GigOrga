import { safeRedirect } from "$lib/redirect";
import { deleteSessionCookie, setLoginCookie } from "$lib/server/authCookies";
import { getDb, getOidc } from "$lib/server/context";
import { invalidateSession } from "$lib/server/services/sessions";
import { redirect } from "@sveltejs/kit";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ locals, url }) => {
  if (locals.user) redirect(303, safeRedirect(url.searchParams.get("redirectTo")));
  return { failed: url.searchParams.has("fehler") };
};

export const actions: Actions = {
  login: async ({ cookies, url }) => {
    const { url: authorizationUrl, checks } = await getOidc().start();
    setLoginCookie(cookies, {
      ...checks,
      redirectTo: safeRedirect(url.searchParams.get("redirectTo")),
    });
    redirect(303, authorizationUrl);
  },
  logout: async ({ cookies, locals }) => {
    if (locals.session) await invalidateSession(getDb(), locals.session.id);
    deleteSessionCookie(cookies);
    redirect(303, "/login");
  },
};
