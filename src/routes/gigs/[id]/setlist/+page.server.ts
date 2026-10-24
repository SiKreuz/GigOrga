import { getDb } from "$lib/server/context";
import { getGig } from "$lib/server/services/gigs";
import { getSetlist } from "$lib/server/services/songs";
import { error } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const db = getDb();
  const gig = await getGig(db, params.id);
  if (gig === undefined) error(404, "Gig nicht gefunden");
  return { gig, setlist: await getSetlist(db, gig.id) };
};
