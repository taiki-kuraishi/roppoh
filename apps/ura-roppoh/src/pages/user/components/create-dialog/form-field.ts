import * as v from "valibot";

import { ROLES } from "@/pages/user/constant";

export const schema = v.object({
  name: v.pipe(v.string(), v.minLength(1, "Name is required")),
  email: v.pipe(v.string(), v.email("Must be a valid email")),
  password: v.pipe(v.string(), v.minLength(8, "Password must be at least 8 characters")),
  role: v.picklist(ROLES),
});

export const defaultValues: v.InferInput<typeof schema> = {
  name: "",
  email: "",
  password: "",
  role: "user",
};
