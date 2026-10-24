import { env } from "$env/dynamic/private";

const read = (name: string, fallback = "") => env[name] ?? fallback;

export const config = {
  dataDir: read("DATA_DIR", "data"),
  geocoderUrl: read("GEOCODER_URL", "https://nominatim.openstreetmap.org"),
  routerUrl: read("ROUTER_URL", "https://router.project-osrm.org"),
  origin: read("ORIGIN", "http://localhost:5173"),
  oidcIssuer: read("OIDC_ISSUER"),
  oidcClientId: read("OIDC_CLIENT_ID"),
  oidcClientSecret: read("OIDC_CLIENT_SECRET"),
  adminEmail: read("ADMIN_EMAIL"),
};
