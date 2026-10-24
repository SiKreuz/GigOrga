import { parseForm, songSchema } from "$lib/forms";
import { getDb } from "$lib/server/context";
import { createSong, deleteSong, listSongs, updateSong } from "$lib/server/services/songs";
import { fail } from "@sveltejs/kit";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => ({ songs: await listSongs(getDb()) });

const songId = (formData: FormData) => {
  const id = formData.get("id");
  return typeof id === "string" ? id : "";
};

export const actions: Actions = {
  create: async ({ request }) => {
    const result = parseForm(songSchema, await request.formData());
    if (!result.success) return fail(400, { form: "new", ...result });
    await createSong(getDb(), result.data);
    return { form: "new", success: true as const };
  },
  update: async ({ request }) => {
    const formData = await request.formData();
    const id = songId(formData);
    const result = parseForm(songSchema, formData);
    if (!result.success) return fail(400, { form: id, ...result });
    await updateSong(getDb(), id, result.data);
    return { form: id, success: true as const };
  },
  delete: async ({ request }) => {
    await deleteSong(getDb(), songId(await request.formData()));
    return { form: "delete", success: true as const };
  },
};
