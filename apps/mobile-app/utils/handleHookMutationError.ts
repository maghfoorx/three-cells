import { ConvexError } from "convex/values";

export function handleHookMutationError(error: unknown) {
  const errorMessage =
    error instanceof ConvexError
      ? error.data
      : "Something went wrong, please try again later.";
  console.log("error:", errorMessage);
}
