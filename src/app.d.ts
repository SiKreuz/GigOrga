import type { Auth } from "$lib/server/services/sessions";

declare global {
  namespace App {
    interface Locals {
      user: Auth["user"] | null;
      session: Auth["session"] | null;
    }
  }
}

export {};
