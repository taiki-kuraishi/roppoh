import type { ReactNode } from "react";

import type { AuthClient } from "../types";

import { AuthClientContext } from "../contexts";

interface Props {
  authClient: AuthClient;
  children: ReactNode;
}

export const BetterAuthQueryProvider = ({ authClient, children }: Props) => (
  <AuthClientContext.Provider value={authClient}>{children}</AuthClientContext.Provider>
);
