import { describe, expect, test } from "vitest";

import { can, requiredAction } from "./permissions";

describe("can", () => {
  test.for([
    ["admin", "edit", true],
    ["admin", "manageUsers", true],
    ["editor", "edit", true],
    ["editor", "manageUsers", false],
    ["viewer", "edit", false],
    ["viewer", "manageUsers", false],
    [undefined, "edit", false],
  ] as const)("%s may %s: %s", ([role, action, expected]) => {
    expect(can(role, action)).toBe(expected);
  });
});

describe("requiredAction", () => {
  test.for([
    ["GET", "/", null],
    ["GET", "/gigs/123", null],
    ["POST", "/gigs/123", "edit"],
    ["POST", "/settings", "edit"],
    ["POST", "/login", null],
    ["GET", "/benutzer", "manageUsers"],
    ["POST", "/benutzer", "manageUsers"],
    ["GET", "/benutzerdefiniert", null],
    ["GET", "/gigs/new", "edit"],
  ] as const)("%s %s needs %s", ([method, path, expected]) => {
    expect(requiredAction(method, path)).toBe(expected);
  });
});
