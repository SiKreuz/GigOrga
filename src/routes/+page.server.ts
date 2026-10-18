import { getDb } from "$lib/server/context";
import { listGigs } from "$lib/server/services/gigs";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => ({ gigs: await listGigs(getDb()) });
