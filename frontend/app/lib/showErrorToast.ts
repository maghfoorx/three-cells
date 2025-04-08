import { toast } from "sonner";

export function showErrorToast(message?: string) {
  toast.error(
    message ?? "Something went wrong on our end. Please try again later.",
    {
      style: {
        background: "red",
        color: "white",
      },
      position: "top-right",
    }
  );
}
