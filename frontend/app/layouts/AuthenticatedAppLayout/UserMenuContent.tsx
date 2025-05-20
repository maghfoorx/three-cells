import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { UserInfo } from "~/components/UserInfo";
import { useMobileNavigation } from "~/lib/hooks/useMobileNavigation";
import { Link } from "react-router";
import { LogOut, Settings } from "lucide-react";
import type { DataModel } from "convex/_generated/dataModel";
import { useAuthActions } from "@convex-dev/auth/react";

interface UserMenuContentProps {
  user: DataModel["users"]["document"];
}

export function UserMenuContent({ user }: UserMenuContentProps) {
  const cleanup = useMobileNavigation();
  const { signOut } = useAuthActions();

  return (
    <>
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <UserInfo user={user} showEmail={true} />
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          <Link className="block w-full" to={"/settings"} onClick={cleanup}>
            <Settings className="mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        asChild
        variant="destructive"
        onClick={() => void signOut()}
      >
        <div>
          <LogOut className="mr-2 text-white hover:text-black" /> Log out
        </div>
      </DropdownMenuItem>
    </>
  );
}
