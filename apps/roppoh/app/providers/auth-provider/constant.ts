import {
  atomWithStorage,
  createJSONStorage,
  unstable_withStorageValidator as withStorageValidator,
} from "jotai/utils";
import * as v from "valibot";

export const OIDC_STORAGE_KEY = "oidc:state";
export const PKCE_CODE_CHALLENGE_METHOD = "S256";

const isTokenExpired = (token: string): boolean => {
  try {
    const splited = token.split(".");
    if (!splited[1]) {
      return true;
    }
    const payload = JSON.parse(atob(splited[1]));
    return typeof payload.exp === "number" ? payload.exp * 1000 < Date.now() : false;
  } catch {
    return true;
  }
};

const OidcStoredStateSchema = v.object({
  accessToken: v.optional(v.string()),
  idToken: v.optional(v.string()),
  user: v.optional(v.record(v.string(), v.unknown())),
});

export type OidcStoredState = v.InferInput<typeof OidcStoredStateSchema>;

const isValidOidcState = (value: unknown): value is OidcStoredState => {
  const result = v.safeParse(OidcStoredStateSchema, value);
  if (!result.success) {
    return false;
  }
  if (typeof result.output.idToken === "string" && isTokenExpired(result.output.idToken)) {
    return false;
  }
  return true;
};

export const oidcStoredStateAtom = atomWithStorage<OidcStoredState>(
  OIDC_STORAGE_KEY,
  {},
  withStorageValidator(isValidOidcState)(createJSONStorage(() => localStorage)),
  { getOnInit: true },
);
