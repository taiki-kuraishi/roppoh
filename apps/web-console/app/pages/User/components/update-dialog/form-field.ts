import * as v from "valibot";

export const schema = v.object({
  name: v.pipe(v.string(), v.minLength(1, "Name is required")),
  email: v.pipe(v.string(), v.email("Must be a valid email")),
});
