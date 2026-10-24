import { createSession, validateSession } from "$lib/server/services/sessions";
import {
  changeUser,
  deleteUser,
  getUser,
  listUsers,
  upsertUserFromClaims,
  UserChangeRefusedError,
} from "$lib/server/services/users";
import { test, userClaims } from "$lib/server/testing";
import { describe, expect } from "vitest";

describe("users", () => {
  test("creates a user on first login and updates it on the next", async ({ db }) => {
    const { id } = await upsertUserFromClaims(db, {
      sub: "pocket-1",
      email: "max@example.com",
      name: "Max",
    });
    const again = await upsertUserFromClaims(db, {
      sub: "pocket-1",
      email: "max@twiceasmad.de",
      name: "Max Mustermann",
    });
    expect(again.id).toBe(id);
    expect(await getUser(db, id)).toMatchObject({
      email: "max@twiceasmad.de",
      name: "Max Mustermann",
    });
  });

  test("keeps users with different subjects apart", async ({ db }) => {
    const a = await upsertUserFromClaims(db, userClaims());
    const b = await upsertUserFromClaims(db, userClaims());
    expect(a.id).not.toBe(b.id);
  });

  test("starts new users as active viewers", async ({ db, insertUser }) => {
    const user = await insertUser();
    expect(await getUser(db, user.id)).toMatchObject({ role: "viewer", active: 1 });
  });

  test("makes the configured admin email an admin", async ({ db }) => {
    const claims = userClaims({ email: "Simon@Twiceasmad.de" });
    const { id } = await upsertUserFromClaims(db, claims, "simon@twiceasmad.de");
    expect(await getUser(db, id)).toMatchObject({ role: "admin" });
  });

  test("promotes an existing user to admin once the email matches", async ({ db }) => {
    const claims = userClaims({ email: "simon@twiceasmad.de" });
    const { id } = await upsertUserFromClaims(db, claims);
    await upsertUserFromClaims(db, claims, "simon@twiceasmad.de");
    expect(await getUser(db, id)).toMatchObject({ role: "admin" });
  });

  test("does not demote an admin whose email no longer matches", async ({ db }) => {
    const claims = userClaims({ email: "simon@twiceasmad.de" });
    const { id } = await upsertUserFromClaims(db, claims, "simon@twiceasmad.de");
    await upsertUserFromClaims(db, claims, "someone@else.de");
    expect(await getUser(db, id)).toMatchObject({ role: "admin" });
  });

  test("lists users by name", async ({ db, insertUser }) => {
    await insertUser({ name: "Zoe" });
    await insertUser({ name: "anna" });
    expect((await listUsers(db)).map((user) => user.name)).toStrictEqual(["anna", "Zoe"]);
  });

  test("changes another user's role", async ({ db, insertUser }) => {
    const admin = await insertUser();
    const user = await insertUser();
    await changeUser(db, admin.id, user.id, { role: "editor" });
    expect(await getUser(db, user.id)).toMatchObject({ role: "editor" });
  });

  test("refuses changes to oneself", async ({ db, insertUser }) => {
    const admin = await insertUser();
    await expect(changeUser(db, admin.id, admin.id, { role: "viewer" })).rejects.toThrow(
      UserChangeRefusedError,
    );
    await expect(deleteUser(db, admin.id, admin.id)).rejects.toThrow(UserChangeRefusedError);
  });

  test("deactivating a user ends their sessions", async ({ db, insertUser }) => {
    const admin = await insertUser();
    const user = await insertUser();
    const { token } = await createSession(db, user.id);
    await changeUser(db, admin.id, user.id, { active: 0 });
    expect(await validateSession(db, token)).toBeNull();
    expect(await upsertUserFromClaims(db, user)).toMatchObject({ active: 0 });
  });

  test("deletes another user", async ({ db, insertUser }) => {
    const admin = await insertUser();
    const user = await insertUser();
    await deleteUser(db, admin.id, user.id);
    expect(await getUser(db, user.id)).toBeNull();
  });
});
