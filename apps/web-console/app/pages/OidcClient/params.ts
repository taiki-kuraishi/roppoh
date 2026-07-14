import { parseAsString, parseAsStringLiteral } from "nuqs";

export const dialogSearchParams = {
  client_id: parseAsString,
  dialog: parseAsStringLiteral(["create", "edit", "delete", "view"]),
};
