import { parseForm, venueSchema } from "$lib/forms";
import { getDb } from "$lib/server/context";
import { createVenue, listVenues } from "$lib/server/services/venues";
import { fail, redirect } from "@sveltejs/kit";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => ({ venues: await listVenues(getDb()) });

export const actions: Actions = {
  default: async ({ request }) => {
    const result = parseForm(venueSchema, await request.formData());
    if (!result.success) return fail(400, result);
    const id = await createVenue(getDb(), result.data);
    redirect(303, `/venues/${id}`);
  },
};
