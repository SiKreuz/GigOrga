import { parseForm, contactSchema } from "$lib/forms";
import { getDb } from "$lib/server/context";
import { createContact, listContacts } from "$lib/server/services/contacts";
import { fail, redirect } from "@sveltejs/kit";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => ({ contacts: await listContacts(getDb()) });

export const actions: Actions = {
  default: async ({ request }) => {
    const result = parseForm(contactSchema, await request.formData());
    if (!result.success) return fail(400, result);
    const id = await createContact(getDb(), result.data);
    redirect(303, `/contacts/${id}`);
  },
};
