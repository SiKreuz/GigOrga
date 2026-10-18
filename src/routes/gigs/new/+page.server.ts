import { newGigSchema, parseForm } from "$lib/forms";
import { getDb } from "$lib/server/context";
import { createGig } from "$lib/server/services/gigs";
import { findOrCreateVenue, listVenues } from "$lib/server/services/venues";
import { fail, redirect } from "@sveltejs/kit";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => ({ venues: await listVenues(getDb()) });

export const actions: Actions = {
  default: async ({ request }) => {
    const result = parseForm(newGigSchema, await request.formData());
    if (!result.success) return fail(400, result);
    const { title, date, status, venueName } = result.data;
    const db = getDb();
    const venueId = venueName === "" ? null : await findOrCreateVenue(db, venueName);
    const id = await createGig(db, { title: title || venueName, date, status, venueId });
    redirect(303, `/gigs/${id}`);
  },
};
