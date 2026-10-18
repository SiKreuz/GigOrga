import {
  accommodationSchema,
  dealSchema,
  gigBasicsSchema,
  hospitalitySchema,
  linkContactSchema,
  parseForm,
  supportActsSchema,
  techSchema,
  timetableSchema,
  travelSchema,
} from "$lib/forms";
import { config } from "$lib/server/config";
import { getDb } from "$lib/server/context";
import { listCars } from "$lib/server/services/cars";
import { listContacts } from "$lib/server/services/contacts";
import {
  deleteGig,
  getGig,
  linkContact,
  unlinkContact,
  updateDeal,
  updateGig,
  updateSupportActs,
  updateTech,
  updateTimetable,
  updateTravel,
} from "$lib/server/services/gigs";
import { routeToGig } from "$lib/server/services/routing";
import { getSettings } from "$lib/server/services/settings";
import { listVenues } from "$lib/server/services/venues";
import { error, fail, redirect } from "@sveltejs/kit";
import type * as v from "valibot";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const db = getDb();
  const gig = await getGig(db, params.id);
  if (gig === undefined) error(404, "Gig nicht gefunden");
  const [venues, contacts, cars, settings] = await Promise.all([
    listVenues(db),
    listContacts(db),
    listCars(db),
    getSettings(db),
  ]);
  return { gig, venues, contacts, cars, settings };
};

type Schema = Parameters<typeof parseForm>[0];

function section<S extends Schema>(
  name: string,
  schema: S,
  save: (id: string, data: v.InferOutput<S>) => Promise<void>,
) {
  return async ({ params, request }: { params: { id: string }; request: Request }) => {
    const result = parseForm(schema, await request.formData());
    if (!result.success) return fail(400, { section: name, ...result });
    await save(params.id, result.data);
    return { section: name, success: true as const };
  };
}

export const actions: Actions = {
  basics: section("basics", gigBasicsSchema, (id, data) => updateGig(getDb(), id, data)),
  timetable: section("timetable", timetableSchema, (id, data) =>
    updateTimetable(getDb(), id, data.entries),
  ),
  lineup: section("lineup", supportActsSchema, (id, data) =>
    updateSupportActs(getDb(), id, data.acts),
  ),
  tech: section("tech", techSchema, (id, data) => updateTech(getDb(), id, data)),
  deal: section("deal", dealSchema, (id, data) => updateDeal(getDb(), id, data)),
  travel: section("travel", travelSchema, (id, data) => updateTravel(getDb(), id, data)),
  hospitality: section("hospitality", hospitalitySchema, (id, data) =>
    updateGig(getDb(), id, data),
  ),
  accommodation: section("accommodation", accommodationSchema, (id, data) =>
    updateGig(getDb(), id, data),
  ),
  route: async ({ params }) => {
    const result = await routeToGig(getDb(), { ...config, fetch }, params.id);
    if (!result.ok) return fail(400, { section: "travel", routeError: result.message });
    return { section: "travel", success: true as const };
  },
  linkContact: section("contacts", linkContactSchema, (id, data) =>
    linkContact(getDb(), id, data.contactId, data.role),
  ),
  unlinkContact: async ({ params, request }) => {
    const contactId = (await request.formData()).get("contactId");
    if (typeof contactId === "string") await unlinkContact(getDb(), params.id, contactId);
    return { section: "contacts", success: true as const };
  },
  delete: async ({ params }) => {
    await deleteGig(getDb(), params.id);
    redirect(303, "/");
  },
};
