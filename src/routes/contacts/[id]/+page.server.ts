import { parseForm, contactSchema } from "$lib/forms";
import { getDb } from "$lib/server/context";
import { deleteContact, getContact, updateContact } from "$lib/server/services/contacts";
import { error, fail, redirect } from "@sveltejs/kit";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const contact = await getContact(getDb(), params.id);
  if (contact === undefined) error(404, "Kontakt nicht gefunden");
  return { contact };
};

export const actions: Actions = {
  update: async ({ params, request }) => {
    const result = parseForm(contactSchema, await request.formData());
    if (!result.success) return fail(400, result);
    await updateContact(getDb(), params.id, result.data);
    return { success: true };
  },
  delete: async ({ params }) => {
    await deleteContact(getDb(), params.id);
    redirect(303, "/contacts");
  },
};
