import type { FastifyReply, FastifyRequest } from "fastify";
import { createRemoteJWKSet, jwtVerify } from "jose";
import {
  ApiError,
  type AuthClaims,
  type AuthScope,
  claimsFromJwtPayload,
  hasScope,
} from "@ai-workforce/shared";

declare module "fastify" {
  interface FastifyRequest {
    auth?: AuthClaims;
    requestId?: string;
  }
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks(supabaseUrl: string) {
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/.well-known/jwks.json`),
    );
  }
  return jwks;
}

export function createAuthHook(options: {
  supabaseUrl: string;
  jwtSecret?: string;
}) {
  return async function authHook(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new ApiError(401, "UNAUTHORIZED", "Missing bearer token");
    }

    const token = header.slice("Bearer ".length);
    let payload: Record<string, unknown>;

    if (options.jwtSecret) {
      const secret = new TextEncoder().encode(options.jwtSecret);
      const verified = await jwtVerify(token, secret, { algorithms: ["HS256"] });
      payload = verified.payload as Record<string, unknown>;
    } else {
      const verified = await jwtVerify(token, getJwks(options.supabaseUrl));
      payload = verified.payload as Record<string, unknown>;
    }

    request.auth = claimsFromJwtPayload(payload);
  };
}

export function requireScope(scope: AuthScope) {
  return async function scopeHook(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    if (!request.auth) {
      throw new ApiError(401, "UNAUTHORIZED", "Not authenticated");
    }
    if (!hasScope(request.auth, scope)) {
      throw new ApiError(403, "FORBIDDEN", `Missing scope: ${scope}`);
    }
  };
}
