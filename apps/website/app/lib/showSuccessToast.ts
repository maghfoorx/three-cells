import { toast } from "sonner";

export function showSuccessToast(message?: string) {
  toast.success(message ?? "Success!", {
    style: {
      background: "green",
      color: "white",
    },
    position: "top-right",
    duration: 900,
  });
}
