import { ConvexError } from "convex/values";
import { toast } from "sonner";

export function handleHookMutationError(error: unknown) {
  const errorMessage =
    error instanceof ConvexError
      ? error.data
      : "Something went wrong, please try again later.";

  toast.success(errorMessage, {
    style: {
      background: "red",
      color: "white",
    },
    position: "top-right",
    duration: 1500,
  });
}
