import { env } from "$env/dynamic/private";

export const config = {
  dataDir: env.DATA_DIR ?? "data",
  geocoderUrl: env.GEOCODER_URL ?? "https://nominatim.openstreetmap.org",
  routerUrl: env.ROUTER_URL ?? "https://router.project-osrm.org",
};
