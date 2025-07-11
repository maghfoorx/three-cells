import type { User } from "~/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useInitials } from "~/lib/hooks/useInitials";
import type { DataModel } from "@packages/backend/convex/_generated/dataModel";

export function UserInfo({
  user,
  showEmail = false,
}: {
  user: DataModel["users"]["document"];
  showEmail?: boolean;
}) {
  const getInitials = useInitials();

  return (
    <>
      <Avatar className="h-8 w-8 overflow-hidden rounded-full">
        <AvatarImage src={user.image} alt={user.name} />
        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
          {user?.name != null && getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.name}</span>
        {showEmail && (
          <span className="text-muted-foreground truncate text-xs">
            {user.email}
          </span>
        )}
      </div>
    </>
  );
}
