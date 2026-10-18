import { getDb } from "$lib/server/context";

export async function GET() {
  await getDb().orm.Gig.select("id").first();
  return new Response("ok");
}
