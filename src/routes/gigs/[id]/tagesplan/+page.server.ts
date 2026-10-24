import { getDb } from "$lib/server/context";
import { getGig } from "$lib/server/services/gigs";
import { error } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const gig = await getGig(getDb(), params.id);
  if (gig === undefined) error(404, "Gig nicht gefunden");
  return { gig };
};
