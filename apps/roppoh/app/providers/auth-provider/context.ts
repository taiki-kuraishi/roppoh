import type { RESET } from "jotai/utils";
import type { AuthorizationServer, Client } from "oauth4webapi";

import { createContext } from "react";

import type { OidcStoredState } from "./constant";

type SetStored = (
  update:
    | OidcStoredState
    | typeof RESET
    | ((prev: OidcStoredState) => OidcStoredState | typeof RESET),
) => void;

interface AuthContextType {
  as?: AuthorizationServer;
  client: Client;
  stored: OidcStoredState;
  setStored: SetStored;
}

export const AuthContext = createContext<AuthContextType>({
  client: { client_id: "", token_endpoint_auth_method: "none" },
  setStored: () => {},
  stored: {},
});
