import { parseForm, tourSchema } from "$lib/forms";
import { getDb } from "$lib/server/context";
import { createTour, listTours } from "$lib/server/services/tours";
import { fail, redirect } from "@sveltejs/kit";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => ({ tours: await listTours(getDb()) });

export const actions: Actions = {
  default: async ({ request }) => {
    const result = parseForm(tourSchema, await request.formData());
    if (!result.success) return fail(400, result);
    const id = await createTour(getDb(), result.data);
    redirect(303, `/tours/${id}`);
  },
};
