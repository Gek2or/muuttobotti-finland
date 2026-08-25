const FALLBACK_ADMIN_TOKEN_SHA256 = "15c1d02f96551dd69273cdc5b4831bc5189d48217c65b3dcc87e4279f1fe352f";
const MOBILE_ADMIN_TOKEN_SHA256 = "9f1b0f9e92d9d5aca1aae78619f27d77dd6e76929e3f0d4928037beda4ca0315";

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function isAdminRequest(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token || token.length > 300) return false;

  const { env } = await import("cloudflare:workers");
  const runtimeEnv = env as unknown as Record<string, unknown>;
  const configuredHash = String(runtimeEnv.ADMIN_TOKEN_SHA256 || FALLBACK_ADMIN_TOKEN_SHA256).trim().toLowerCase();
  const actualHash = await sha256(token);
  return [configuredHash, MOBILE_ADMIN_TOKEN_SHA256].some(expectedHash => constantTimeEqual(actualHash, expectedHash));
}

export function unauthorized() {
  return Response.json(
    { error: "Unauthorized" },
    { status: 401, headers: { "Cache-Control": "no-store", "WWW-Authenticate": "Bearer" } },
  );
}
