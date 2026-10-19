import { createSession, invalidateSession, validateSession } from "$lib/server/services/sessions";
import { test } from "$lib/server/testing";
import { describe, expect } from "vitest";

const day = 24 * 60 * 60 * 1000;

describe("sessions", () => {
  test("validates a fresh session and returns its user", async ({ db, insertUser }) => {
    const user = await insertUser();
    const { token } = await createSession(db, user.id);
    expect(await validateSession(db, token)).toMatchObject({
      user: { id: user.id, name: user.name },
    });
  });

  test("rejects unknown tokens", async ({ db, insertUser }) => {
    const user = await insertUser();
    await createSession(db, user.id);
    expect(await validateSession(db, "not-a-token")).toBeNull();
  });

  test("does not store the token itself", async ({ db, insertUser }) => {
    const user = await insertUser();
    const { token } = await createSession(db, user.id);
    expect(await db.orm.Session.where({ id: token }).first()).toBeNull();
  });

  test("rejects and removes expired sessions", async ({ db, insertUser }) => {
    const user = await insertUser();
    const { token } = await createSession(db, user.id);
    const later = new Date(Date.now() + 31 * day);
    expect(await validateSession(db, token, later)).toBeNull();
    expect(await db.orm.Session.where({ userId: user.id }).first()).toBeNull();
  });

  test("extends a session that is past half its lifetime", async ({ db, insertUser }) => {
    const user = await insertUser();
    const { token, expiresAt } = await createSession(db, user.id);
    const later = new Date(Date.now() + 20 * day);
    const result = await validateSession(db, token, later);
    expect(result?.session.expiresAt.getTime()).toBeGreaterThan(expiresAt.getTime());
    expect(await validateSession(db, token, new Date(Date.now() + 40 * day))).not.toBeNull();
  });

  test("invalidates a session", async ({ db, insertUser }) => {
    const user = await insertUser();
    const { id, token } = await createSession(db, user.id);
    await invalidateSession(db, id);
    expect(await validateSession(db, token)).toBeNull();
  });
});
