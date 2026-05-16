import { describe, expect, it } from "vitest";
import { claimsFromJwtPayload, hasScope } from "./auth.js";

describe("auth scope enforcement", () => {
  it("grants admin write scopes", () => {
    const claims = claimsFromJwtPayload({
      sub: "user_1",
      email: "admin@example.com",
      app_metadata: {
        tenant_id: "tenant_1",
        role: "admin",
      },
    });

    expect(hasScope(claims, "admin:write")).toBe(true);
  });

  it("prevents viewer write scopes", () => {
    const claims = claimsFromJwtPayload({
      sub: "user_2",
      email: "viewer@example.com",
      app_metadata: {
        tenant_id: "tenant_1",
        role: "viewer",
      },
    });

    expect(hasScope(claims, "runs:write")).toBe(false);
  });

  it("allows explicit scope overrides", () => {
    const claims = claimsFromJwtPayload({
      sub: "svc_1",
      email: "svc@example.com",
      app_metadata: {
        tenant_id: "tenant_1",
        role: "viewer",
        scopes: ["runs:write"],
      },
    });

    expect(hasScope(claims, "runs:write")).toBe(true);
  });

  it("requires tenant attribution", () => {
    expect(() =>
      claimsFromJwtPayload({
        sub: "broken_user",
      }),
    ).toThrow(/tenant_id/i);
  });
});
