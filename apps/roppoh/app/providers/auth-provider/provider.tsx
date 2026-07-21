import type { Client } from "oauth4webapi";

import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai/react";
import { discoveryRequest, processDiscoveryResponse } from "oauth4webapi";

import { oidcStoredStateAtom } from "./constant";
import { AuthContext } from "./context";

interface Props {
  issuer: string;
  clientId: string;
  children: React.ReactNode;
}

export const AuthProvider = (props: Props) => {
  const client: Client = {
    client_id: props.clientId,
    redirect_uris: [`${globalThis.location.origin}/callback`],
    token_endpoint_auth_method: "none",
  };

  const [stored, setStored] = useAtom(oidcStoredStateAtom);

  const { data: as } = useQuery({
    enabled: Boolean(props.issuer),
    queryFn: async () => {
      const issuerUrl = new URL(props.issuer);
      const response = await discoveryRequest(issuerUrl, { algorithm: "oidc" });
      return processDiscoveryResponse(issuerUrl, response);
    },
    queryKey: ["oidc-discovery", props.issuer],
    staleTime: Infinity,
  });

  return (
    <AuthContext.Provider value={{ as, client, setStored, stored }}>
      {props.children}
    </AuthContext.Provider>
  );
};
