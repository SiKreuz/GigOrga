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
