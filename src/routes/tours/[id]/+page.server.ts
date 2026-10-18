import { parseForm, tourSchema } from "$lib/forms";
import { config } from "$lib/server/config";
import { getDb } from "$lib/server/context";
import { routeTour } from "$lib/server/services/routing";
import { getSettings } from "$lib/server/services/settings";
import { deleteTour, getTour, updateTour } from "$lib/server/services/tours";
import { error, fail, redirect } from "@sveltejs/kit";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const db = getDb();
  const tour = await getTour(db, params.id);
  if (tour === undefined) error(404, "Tour nicht gefunden");
  return { tour, settings: await getSettings(db) };
};

export const actions: Actions = {
  update: async ({ params, request }) => {
    const result = parseForm(tourSchema, await request.formData());
    if (!result.success) return fail(400, result);
    await updateTour(getDb(), params.id, result.data);
    return { success: true };
  },
  route: async ({ params }) => {
    const result = await routeTour(getDb(), { ...config, fetch }, params.id);
    if (!result.ok) return fail(400, { routeError: result.message });
    return { success: true };
  },
  delete: async ({ params }) => {
    await deleteTour(getDb(), params.id);
    redirect(303, "/tours");
  },
};
