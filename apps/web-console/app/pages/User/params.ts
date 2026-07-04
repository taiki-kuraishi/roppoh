import { parseAsString, parseAsStringLiteral } from "nuqs";

export const dialogSearchParams = {
  user_id: parseAsString,
  dialog: parseAsStringLiteral([
    "create",
    "view",
    "edit",
    "role",
    "ban",
    "password",
    "sessions",
    "impersonate",
    "delete",
  ]),
};
