import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { UserInfo } from "~/components/UserInfo";
import { useMobileNavigation } from "~/lib/hooks/useMobileNavigation";
import { type User } from "~/types";
import { Link, useNavigate } from "react-router";
import { LogOut, Settings } from "lucide-react";
import { useApolloClient, useMutation } from "@apollo/client";
import { LOGOUT_MUTATION_QUERY } from "~/lib/globalQueries";
import { showErrorToast } from "~/lib/showErrorToast";

interface UserMenuContentProps {
  user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
  const cleanup = useMobileNavigation();
  const navigate = useNavigate();
  const client = useApolloClient();

  const [logoutMutation] = useMutation(LOGOUT_MUTATION_QUERY);

  const handleLogout = async () => {
    const { data, errors } = await logoutMutation();
    if (data?.logout?.success) {
      cleanup();
      client.resetStore();
      navigate("/");
    } else {
      showErrorToast("Something went wrong. Please try again later.");
    }
  };

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
      <DropdownMenuItem asChild variant="destructive" onClick={handleLogout}>
        <div>
          <LogOut className="mr-2 text-white hover:text-black" /> Log out
        </div>
      </DropdownMenuItem>
    </>
  );
}
