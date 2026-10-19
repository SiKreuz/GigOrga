import { describe, expect, test } from "vitest";

import { can } from "./permissions";

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
