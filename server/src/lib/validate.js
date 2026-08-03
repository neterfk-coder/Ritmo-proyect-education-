import { ApiError } from "./http.js";

/** Thin zod wrapper so route handlers stay readable. */
export function parse(schema, payload) {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new ApiError(400, "That request is missing something.", result.error.flatten());
  }
  return result.data;
}
