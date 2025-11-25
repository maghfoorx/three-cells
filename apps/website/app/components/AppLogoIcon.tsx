import { cn } from "~/lib/utils";

export default function AppLogoIcon({ className }: { className: string }) {
  return (
    <div>
      <img
        loading="lazy"
        src="/meditating.webp"
        alt="Three Cells application logo"
        className={cn("aspect-square", className)}
        fetchPriority="high"
      />
    </div>
  );
}
