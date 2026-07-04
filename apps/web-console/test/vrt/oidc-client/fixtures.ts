import type { RequestHandler } from "msw";

import { HttpResponse, http } from "msw";

const mockClients = [
  {
    client_id: "client-1-id",
    client_name: "Test Client 1",
    client_secret: "secret-1",
    disabled: false,
    redirect_uris: ["http://localhost:3000/callback"],
  },
  {
    client_id: "client-2-id",
    client_name: undefined,
    client_secret: "secret-2",
    disabled: true,
    redirect_uris: ["http://localhost:4000/callback"],
  },
];

export const getClientsHandler = http.get("*/oauth2/get-clients", () =>
  HttpResponse.json(mockClients),
) satisfies RequestHandler;
