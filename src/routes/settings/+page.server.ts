import { carSchema, parseForm, settingsSchema, soundEngineerSchema } from "$lib/forms";
import { getDb } from "$lib/server/context";
import { createCar, deleteCar, listCars, updateCar } from "$lib/server/services/cars";
import { getSettings, updateSettings } from "$lib/server/services/settings";
import {
  archiveSoundEngineer,
  createSoundEngineer,
  listSoundEngineers,
  updateSoundEngineer,
} from "$lib/server/services/soundEngineers";
import { fail } from "@sveltejs/kit";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const db = getDb();
  return {
    settings: await getSettings(db),
    cars: await listCars(db),
    soundEngineers: await listSoundEngineers(db),
  };
};

const formId = (formData: FormData) => {
  const id = formData.get("id");
  return typeof id === "string" ? id : "";
};

export const actions: Actions = {
  settings: async ({ request }) => {
    const result = parseForm(settingsSchema, await request.formData());
    if (!result.success) return fail(400, { form: "settings", ...result });
    await updateSettings(getDb(), result.data);
    return { form: "settings", success: true as const };
  },
  createCar: async ({ request }) => {
    const result = parseForm(carSchema, await request.formData());
    if (!result.success) return fail(400, { form: "new", ...result });
    await createCar(getDb(), result.data);
    return { form: "new", success: true as const };
  },
  updateCar: async ({ request }) => {
    const formData = await request.formData();
    const id = formId(formData);
    const result = parseForm(carSchema, formData);
    if (!result.success) return fail(400, { form: id, ...result });
    await updateCar(getDb(), id, result.data);
    return { form: id, success: true as const };
  },
  deleteCar: async ({ request }) => {
    await deleteCar(getDb(), formId(await request.formData()));
    return { form: "delete", success: true as const };
  },
  createSoundEngineer: async ({ request }) => {
    const result = parseForm(soundEngineerSchema, await request.formData());
    if (!result.success) return fail(400, { form: "newEngineer", ...result });
    await createSoundEngineer(getDb(), result.data);
    return { form: "newEngineer", success: true as const };
  },
  updateSoundEngineer: async ({ request }) => {
    const formData = await request.formData();
    const id = formId(formData);
    const result = parseForm(soundEngineerSchema, formData);
    if (!result.success) return fail(400, { form: id, ...result });
    await updateSoundEngineer(getDb(), id, result.data);
    return { form: id, success: true as const };
  },
  archiveSoundEngineer: async ({ request }) => {
    await archiveSoundEngineer(getDb(), formId(await request.formData()));
    return { form: "archive", success: true as const };
  },
};
