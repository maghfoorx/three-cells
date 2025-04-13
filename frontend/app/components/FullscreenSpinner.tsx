import { Icon } from "./Icon";
import { Loader2 } from "lucide-react";

export default function FullscreenSpinner() {
  return (
    <main className="h-screen flex items-center justify-center">
      <Icon
        iconNode={Loader2}
        className="animate-spin h-10 w-10 text-primary"
      />
    </main>
  );
}
