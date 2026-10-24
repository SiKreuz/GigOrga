import { parseForm, userChangeSchema } from "$lib/forms";
import { config } from "$lib/server/config";
import { getDb } from "$lib/server/context";
import { changeUser, deleteUser, listUsers, UserChangeRefused } from "$lib/server/services/users";
import { fail } from "@sveltejs/kit";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => ({
  users: await listUsers(getDb()),
  identityProvider: config.oidcIssuer,
});

async function refusable(fn: () => Promise<void>) {
  try {
    await fn();
    return { success: true as const };
  } catch (error) {
    if (error instanceof UserChangeRefused) return fail(400, { message: error.message });
    throw error;
  }
}

export const actions: Actions = {
  change: async ({ request, locals }) => {
    const result = parseForm(userChangeSchema, await request.formData());
    if (!result.success) return fail(400, { message: "Ungültige Änderung" });
    const { id, ...change } = result.data;
    return refusable(() => changeUser(getDb(), locals.user?.id ?? "", id, change));
  },
  delete: async ({ request, locals }) => {
    const result = parseForm(userChangeSchema, await request.formData());
    if (!result.success) return fail(400, { message: "Ungültige Änderung" });
    return refusable(() => deleteUser(getDb(), locals.user?.id ?? "", result.data.id));
  },
};
