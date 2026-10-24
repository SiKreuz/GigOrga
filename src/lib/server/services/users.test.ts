import { getUser, upsertUserFromClaims } from "$lib/server/services/users";
import { test } from "$lib/server/testing";
import { describe, expect } from "vitest";

describe("users", () => {
  test("creates a user on first login and updates it on the next", async ({ db }) => {
    const id = await upsertUserFromClaims(db, {
      sub: "pocket-1",
      email: "max@example.com",
      name: "Max",
    });
    const again = await upsertUserFromClaims(db, {
      sub: "pocket-1",
      email: "max@twiceasmad.de",
      name: "Max Mustermann",
    });
    expect(again).toBe(id);
    expect(await getUser(db, id)).toMatchObject({
      email: "max@twiceasmad.de",
      name: "Max Mustermann",
    });
  });

  test("keeps users with different subjects apart", async ({ db }) => {
    const a = await upsertUserFromClaims(db, { sub: "a", email: "", name: "A" });
    const b = await upsertUserFromClaims(db, { sub: "b", email: "", name: "B" });
    expect(a).not.toBe(b);
  });
});
