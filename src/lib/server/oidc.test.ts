import { createOidc } from "$lib/server/oidc";
import { beforeAll, describe, expect, test } from "vitest";

const issuer = "https://id.example.com";
const clientId = "gigorga";
const redirectUri = "https://gigs.example.com/auth/callback";

let keys: CryptoKeyPair;
let jwk: JsonWebKey;

const base64url = (value: string | Uint8Array) => Buffer.from(value).toString("base64url");

async function idToken(nonce: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", kid: "test", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: issuer,
      aud: clientId,
      sub: "pocket-1",
      email: "max@twiceasmad.de",
      name: "Max",
      nonce,
      iat: now,
      exp: now + 300,
    }),
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    keys.privateKey,
    new TextEncoder().encode(`${header}.${payload}`),
  );
  return `${header}.${payload}.${base64url(new Uint8Array(signature))}`;
}

function provider(nonce: () => string) {
  return async (url: string) => {
    if (url === `${issuer}/.well-known/openid-configuration`) {
      return Response.json({
        issuer,
        authorization_endpoint: `${issuer}/authorize`,
        token_endpoint: `${issuer}/api/oidc/token`,
        jwks_uri: `${issuer}/.well-known/jwks.json`,
        id_token_signing_alg_values_supported: ["RS256"],
      });
    }
    if (url === `${issuer}/.well-known/jwks.json`) {
      return Response.json({ keys: [{ ...jwk, kid: "test", alg: "RS256", use: "sig" }] });
    }
    if (url === `${issuer}/api/oidc/token`) {
      return Response.json({
        access_token: "access",
        token_type: "Bearer",
        expires_in: 300,
        id_token: await idToken(nonce()),
      });
    }
    return new Response("not found", { status: 404 });
  };
}

function setup() {
  let nonce = "";
  const oidc = createOidc({
    issuer,
    clientId,
    clientSecret: "secret",
    redirectUri,
    fetch: provider(() => nonce),
  });
  return { oidc, setNonce: (value: string) => (nonce = value) };
}

describe("oidc", () => {
  beforeAll(async () => {
    keys = await crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"],
    );
    jwk = await crypto.subtle.exportKey("jwk", keys.publicKey);
  });

  test("builds an authorization url with state, nonce and PKCE", async () => {
    const { oidc } = setup();
    const { url, checks } = await oidc.start();
    expect(url.origin + url.pathname).toBe(`${issuer}/authorize`);
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid profile email",
      state: checks.state,
      nonce: checks.nonce,
      code_challenge_method: "S256",
    });
    expect(url.searchParams.get("code_challenge")).not.toBe(checks.codeVerifier);
  });

  test("exchanges the code for the user's claims", async () => {
    const { oidc, setNonce } = setup();
    const { checks } = await oidc.start();
    setNonce(checks.nonce);
    const callback = new URL(`${redirectUri}?code=abc&state=${checks.state}`);
    expect(await oidc.finish(callback, checks)).toStrictEqual({
      sub: "pocket-1",
      email: "max@twiceasmad.de",
      name: "Max",
    });
  });

  test("rejects a callback with a different state", async () => {
    const { oidc, setNonce } = setup();
    const { checks } = await oidc.start();
    setNonce(checks.nonce);
    const callback = new URL(`${redirectUri}?code=abc&state=forged`);
    await expect(oidc.finish(callback, checks)).rejects.toThrow("invalid response encountered");
  });

  test("rejects an id token with a different nonce", async () => {
    const { oidc, setNonce } = setup();
    const { checks } = await oidc.start();
    setNonce("replayed");
    const callback = new URL(`${redirectUri}?code=abc&state=${checks.state}`);
    await expect(oidc.finish(callback, checks)).rejects.toThrow(
      "unexpected JWT claim value encountered",
    );
  });
});
