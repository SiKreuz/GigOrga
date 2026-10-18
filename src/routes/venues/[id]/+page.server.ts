import { parseForm, venueSchema } from "$lib/forms";
import { getDb } from "$lib/server/context";
import { deleteVenue, getVenue, updateVenue } from "$lib/server/services/venues";
import { error, fail, redirect } from "@sveltejs/kit";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const venue = await getVenue(getDb(), params.id);
  if (venue === undefined) error(404, "Venue nicht gefunden");
  return { venue };
};

export const actions: Actions = {
  update: async ({ params, request }) => {
    const result = parseForm(venueSchema, await request.formData());
    if (!result.success) return fail(400, result);
    await updateVenue(getDb(), params.id, result.data);
    return { success: true };
  },
  delete: async ({ params }) => {
    await deleteVenue(getDb(), params.id);
    redirect(303, "/venues");
  },
};
