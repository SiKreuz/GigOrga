import * as client from "openid-client";

export type OidcSettings = {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  fetch?: client.CustomFetch;
};

export type LoginChecks = { state: string; nonce: string; codeVerifier: string };

const text = (value: unknown) => (typeof value === "string" ? value : "");

export function createOidc({ issuer, clientId, clientSecret, redirectUri, fetch }: OidcSettings) {
  let configuration: Promise<client.Configuration> | undefined;

  function discover() {
    configuration ??= client
      .discovery(new URL(issuer), clientId, clientSecret, undefined, {
        ...(fetch && { [client.customFetch]: fetch }),
        // oxlint-disable-next-line typescript/no-deprecated -- plain http only for a local Pocket ID
        execute: issuer.startsWith("http://") ? [client.allowInsecureRequests] : [],
      })
      .catch((error: unknown) => {
        configuration = undefined;
        throw error;
      });
    return configuration;
  }

  return {
    async start() {
      const config = await discover();
      const checks: LoginChecks = {
        state: client.randomState(),
        nonce: client.randomNonce(),
        codeVerifier: client.randomPKCECodeVerifier(),
      };
      const url = client.buildAuthorizationUrl(config, {
        redirect_uri: redirectUri,
        scope: "openid profile email",
        state: checks.state,
        nonce: checks.nonce,
        code_challenge: await client.calculatePKCECodeChallenge(checks.codeVerifier),
        code_challenge_method: "S256",
      });
      return { url, checks };
    },

    async finish(url: URL, checks: LoginChecks) {
      const tokens = await client.authorizationCodeGrant(await discover(), url, {
        expectedState: checks.state,
        expectedNonce: checks.nonce,
        pkceCodeVerifier: checks.codeVerifier,
        idTokenExpected: true,
      });
      const claims = tokens.claims();
      if (!claims) throw new Error("ID token missing");
      return { sub: claims.sub, email: text(claims.email), name: text(claims.name) };
    },
  };
}

export type Oidc = ReturnType<typeof createOidc>;
