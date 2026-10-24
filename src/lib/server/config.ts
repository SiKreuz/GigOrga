import { env } from "$env/dynamic/private";

export const config = {
  dataDir: env.DATA_DIR ?? "data",
  geocoderUrl: env.GEOCODER_URL ?? "https://nominatim.openstreetmap.org",
  routerUrl: env.ROUTER_URL ?? "https://router.project-osrm.org",
  origin: env.ORIGIN ?? "http://localhost:5173",
  oidcIssuer: env.OIDC_ISSUER ?? "",
  oidcClientId: env.OIDC_CLIENT_ID ?? "",
  oidcClientSecret: env.OIDC_CLIENT_SECRET ?? "",
  adminEmail: env.ADMIN_EMAIL ?? "",
};
