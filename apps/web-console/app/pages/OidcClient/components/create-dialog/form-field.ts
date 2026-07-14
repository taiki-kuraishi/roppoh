import * as v from "valibot";

export const TOKEN_ENDPOINT_AUTH_METHODS = [
  "none",
  "client_secret_basic",
  "client_secret_post",
] as const;

export const schema = v.object({
  client_name: v.pipe(v.string(), v.minLength(3, "Client name must be at least 3 characters")),
  redirect_uris: v.pipe(
    v.array(v.pipe(v.string(), v.url("Must be a valid URL"))),
    v.minLength(1, "At least one redirect URI is required"),
  ),
  token_endpoint_auth_method: v.picklist(TOKEN_ENDPOINT_AUTH_METHODS),
});

export const defaultValues: v.InferInput<typeof schema> = {
  client_name: "",
  redirect_uris: [],
  token_endpoint_auth_method: "client_secret_basic",
};
