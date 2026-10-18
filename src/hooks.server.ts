import { getDb } from "$lib/server/context";
import type { ServerInit } from "@sveltejs/kit";

export const init: ServerInit = () => {
  getDb();
};
