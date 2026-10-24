import type { Role } from "./labels";

export type Action = "edit" | "manageUsers";

const allowed: Record<Role, Action[]> = {
  admin: ["edit", "manageUsers"],
  editor: ["edit"],
  viewer: [],
};

export function can(role: Role | undefined, action: Action): boolean {
  return role !== undefined && allowed[role].includes(action);
}

export function requiredAction(method: string, path: string): Action | null {
  if (path === "/benutzer" || path.startsWith("/benutzer/")) return "manageUsers";
  if (path === "/gigs/new") return "edit";
  if (method === "GET" || method === "HEAD" || path === "/login") return null;
  return "edit";
}
