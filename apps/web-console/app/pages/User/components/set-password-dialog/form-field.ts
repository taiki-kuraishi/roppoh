import * as v from "valibot";

export const schema = v.object({
  newPassword: v.pipe(v.string(), v.minLength(8, "Password must be at least 8 characters")),
});

export const defaultValues: v.InferInput<typeof schema> = {
  newPassword: "",
};
