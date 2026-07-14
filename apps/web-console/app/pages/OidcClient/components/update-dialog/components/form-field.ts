import * as v from "valibot";

export const schema = v.object({
  client_name: v.pipe(v.string(), v.minLength(3, "Client name must be at least 3 characters")),
  redirect_uris: v.pipe(
    v.array(v.pipe(v.string(), v.url("Must be a valid URL"))),
    v.minLength(1, "At least one redirect URI is required"),
  ),
});
