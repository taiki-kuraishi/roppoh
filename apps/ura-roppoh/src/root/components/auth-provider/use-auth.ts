// oxlint-disable max-statements, max-lines, max-lines-per-function
// TODO: アクション別のフックに分割して max-lines(150)/ max-lines-per-function(100)を満たす
// This code is based on: https://github.com/better-auth/better-auth/tree/main/demo/oidc-client

import { RESET } from "jotai/utils";
import * as oauth from "oauth4webapi";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

import { OIDC_STORAGE_KEY, PKCE_CODE_CHALLENGE_METHOD } from "./constant";
import { AuthContext } from "./context";

const WEB_STORAGE_KEY = "oidc:auth";

interface LoginParams {
  scope?: string;
  redirectUri?: string;
}

export const useAuth = () => {
  const { stored, setStored, client, as } = useContext(AuthContext);
  const [isHandlingRedirect, setHandlingRedirect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (params?: LoginParams) => {
    if (!as || !as.authorization_endpoint) {
      toast.error("Authentication server info dose not found.");
      return;
    }

    const scope = params?.scope || "openid profile email";
    let redirectUri = params?.redirectUri;
    if (!redirectUri && Array.isArray(client.redirect_uris) && client.redirect_uris.length > 0) {
      const [firstUri] = client.redirect_uris;
      redirectUri = typeof firstUri === "string" ? firstUri : undefined;
    }
    redirectUri ||= `${globalThis.location.origin}/callback`;

    const code_verifier = oauth.generateRandomCodeVerifier();
    const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier);

    const authorizationUrl = new URL(as.authorization_endpoint);
    authorizationUrl.searchParams.set("client_id", client.client_id);
    authorizationUrl.searchParams.set("redirect_uri", redirectUri);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("scope", scope);
    authorizationUrl.searchParams.set("code_challenge", code_challenge);
    authorizationUrl.searchParams.set("code_challenge_method", PKCE_CODE_CHALLENGE_METHOD);

    const state = oauth.generateRandomState();
    authorizationUrl.searchParams.set("state", state);

    const nonce = oauth.generateRandomNonce();
    authorizationUrl.searchParams.set("nonce", nonce);

    sessionStorage.setItem(
      WEB_STORAGE_KEY,
      JSON.stringify({ code_verifier, nonce, redirectUri, state }),
    );

    globalThis.location.assign(authorizationUrl.toString());
  };

  const handleLoginRedirect = async () => {
    if (!as || isHandlingRedirect) {
      return;
    }

    setHandlingRedirect(true);

    const storage = sessionStorage.getItem(WEB_STORAGE_KEY);
    if (!storage) {
      console.error("No stored code_verifier and nonce found");
      setHandlingRedirect(false);
      return;
    }
    sessionStorage.removeItem(WEB_STORAGE_KEY);
    const { code_verifier, state, nonce, redirectUri } = JSON.parse(storage);

    try {
      const currentUrl = new URL(globalThis.location.href);
      // Throws on error in v3
      const params = oauth.validateAuthResponse(as, client, currentUrl, state);

      const authorizationResponse = await oauth.authorizationCodeGrantRequest(
        as,
        client,
        oauth.None(),
        params,
        redirectUri,
        code_verifier,
      );

      // Throws WWWAuthenticateChallengeError / ResponseBodyError in v3
      const result = await oauth.processAuthorizationCodeResponse(
        as,
        client,
        authorizationResponse,
        {
          expectedNonce: nonce,
          requireIdToken: true,
        },
      );

      setStored((prev) => ({ ...prev, accessToken: result.access_token }));
      if (result.id_token) {
        setStored((prev) => ({ ...prev, idToken: result.id_token }));
      }

      const claims = oauth.getValidatedIdTokenClaims(result);
      if (!claims) {
        console.error("No ID token claims found");
        setHandlingRedirect(false);
        return;
      }

      // Throws WWWAuthenticateChallengeError in v3
      const userInfoResponse = await oauth.userInfoRequest(as, client, result.access_token);
      const userInfo = await oauth.processUserInfoResponse(
        as,
        client,
        claims.sub,
        userInfoResponse,
      );
      setStored((prev) => ({ ...prev, user: userInfo as Record<string, unknown> }));

      globalThis.history.replaceState(
        {},
        document.title,
        redirectUri || globalThis.location.origin,
      );
    } catch (error) {
      console.error("Error handling login redirect", error);
    } finally {
      setHandlingRedirect(false);
    }
  };

  const logout = () => {
    if (!as || !stored.idToken || !as.end_session_endpoint) {
      toast.error("Authentication server info dose not found.");
      return;
    }

    const endSessionUrl = new URL(as.end_session_endpoint);
    endSessionUrl.searchParams.set("post_logout_redirect_uri", globalThis.location.origin);
    endSessionUrl.searchParams.set("id_token_hint", stored.idToken);

    setStored(RESET);
    localStorage.removeItem(OIDC_STORAGE_KEY);

    globalThis.location.assign(endSessionUrl.toString());
  };

  useEffect(() => {
    if (!as || !client) {
      return;
    }

    if (!globalThis.location.search.includes("code=")) {
      setIsLoading(false);
      return;
    }

    void handleLoginRedirect()
      .catch((error: unknown) => {
        console.error("Failed to handle login redirect", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [globalThis.location.search, as, client]);

  return {
    accessToken: stored.accessToken,
    handleLoginRedirect,
    isAuthenticated: Boolean(stored.user),
    isLoading,
    login,
    logout,
    user: stored.user,
  };
};
