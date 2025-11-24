import type { SVGAttributes, HTMLAttributes } from "react";
import { cn } from "~/lib/utils";

export default function AppLogoIcon({ className }: { className: string }) {
  return (
    <div>
      <img src="/meditating.webp" className={cn("aspect-square", className)} />
    </div>
  );
}
