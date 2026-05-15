import { z } from "zod";

export const authClaimsSchema = z.object({
  sub: z.string(),
  email: z.string().email().optional(),
  tenant_id: z.string().min(1),
  role: z.enum(["owner", "admin", "member", "viewer"]).default("member"),
  scopes: z.array(z.string()).default([]),
});

export type AuthClaims = z.infer<typeof authClaimsSchema>;

export type AuthScope =
  | "runs:read"
  | "runs:write"
  | "agents:read"
  | "agents:write"
  | "workflows:read"
  | "workflows:write"
  | "admin:write"
  | "billing:read";

const roleScopes: Record<AuthClaims["role"], AuthScope[]> = {
  owner: [
    "runs:read",
    "runs:write",
    "agents:read",
    "agents:write",
    "workflows:read",
    "workflows:write",
    "admin:write",
    "billing:read",
  ],
  admin: [
    "runs:read",
    "runs:write",
    "agents:read",
    "agents:write",
    "workflows:read",
    "workflows:write",
    "admin:write",
    "billing:read",
  ],
  member: [
    "runs:read",
    "runs:write",
    "agents:read",
    "agents:write",
    "workflows:read",
    "workflows:write",
  ],
  viewer: ["runs:read", "agents:read", "workflows:read", "billing:read"],
};

export function hasScope(claims: AuthClaims, required: AuthScope): boolean {
  if (claims.scopes.includes(required)) return true;
  return roleScopes[claims.role].includes(required);
}

/** Decode Supabase JWT payload (verify signature in gateway middleware). */
export function decodeJwtPayload(token: string): unknown {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }
  const payload = Buffer.from(parts[1]!, "base64url").toString("utf8");
  return JSON.parse(payload) as unknown;
}

export function claimsFromJwtPayload(payload: unknown): AuthClaims {
  const record = payload as Record<string, unknown>;
  const appMeta =
    (record.app_metadata as Record<string, unknown> | undefined) ?? {};
  const tenantId =
    (appMeta.tenant_id as string | undefined) ??
    (record.tenant_id as string | undefined);

  if (!tenantId) {
    throw new Error("Missing tenant_id in JWT app_metadata");
  }

  return authClaimsSchema.parse({
    sub: record.sub,
    email: record.email,
    tenant_id: tenantId,
    role: appMeta.role ?? "member",
    scopes: appMeta.scopes ?? [],
  });
}
