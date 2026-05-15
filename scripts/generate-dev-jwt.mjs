import { createHmac } from "node:crypto";

const secret = process.env.SUPABASE_JWT_SECRET ?? "dev-jwt-secret-change-me";
const tenantId = process.env.DEV_TENANT_ID ?? "tenant_dev";
const sub = process.env.DEV_USER_SUB ?? "user_dev";

function base64url(input) {
  return Buffer.from(input)
    .toString("base64url");
}

const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
const now = Math.floor(Date.now() / 1000);
const payload = base64url(
  JSON.stringify({
    sub,
    email: "dev@example.com",
    iat: now,
    exp: now + 60 * 60 * 24,
    app_metadata: {
      tenant_id: tenantId,
      role: "owner",
      scopes: [],
    },
  }),
);

const data = `${header}.${payload}`;
const signature = createHmac("sha256", secret).update(data).digest("base64url");
const token = `${data}.${signature}`;

console.log(token);
