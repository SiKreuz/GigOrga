import { describe, expect, test } from "vitest";

import { safeRedirect } from "./redirect";

describe("safeRedirect", () => {
  test.for([
    ["/gigs/123", "/gigs/123"],
    ["/tours?jahr=2026", "/tours?jahr=2026"],
    [null, "/"],
    ["", "/"],
    ["https://evil.example.com", "/"],
    ["//evil.example.com", "/"],
    ["/\\evil.example.com", "/"],
    ["gigs", "/"],
  ] as const)("%s → %s", ([target, expected]) => {
    expect(safeRedirect(target)).toBe(expected);
  });
});
