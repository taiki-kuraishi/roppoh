import { useContext } from "react";

import type { AuthClient } from "../types";

import { AuthClientContext } from "../contexts";

export const useAuthClient = (): AuthClient => {
  const client = useContext(AuthClientContext);

  if (client === null) {
    throw new Error("useAuthClient must be used within <BetterAuthQueryProvider>.");
  }

  return client;
};
