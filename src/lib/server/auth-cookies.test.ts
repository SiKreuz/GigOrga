import type { Cookies } from "@sveltejs/kit";
import { describe, expect, test } from "vitest";

import { takeLoginCookie } from "./auth-cookies";

function fakeCookies(login?: string) {
  const jar = new Map(login === undefined ? [] : [["login", login]]);
  return {
    get: (name: string) => jar.get(name),
    delete: (name: string) => jar.delete(name),
  } as unknown as Cookies;
}

const state = { state: "s", nonce: "n", codeVerifier: "c", redirectTo: "/gigs" };

describe("takeLoginCookie", () => {
  test("returns the stored login state once", () => {
    const cookies = fakeCookies(JSON.stringify(state));
    expect(takeLoginCookie(cookies)).toEqual(state);
    expect(takeLoginCookie(cookies)).toBeUndefined();
  });

  test("ignores missing, malformed and incomplete cookies", () => {
    expect(takeLoginCookie(fakeCookies())).toBeUndefined();
    expect(takeLoginCookie(fakeCookies("{"))).toBeUndefined();
    expect(takeLoginCookie(fakeCookies(JSON.stringify({ state: "s" })))).toBeUndefined();
  });
});
