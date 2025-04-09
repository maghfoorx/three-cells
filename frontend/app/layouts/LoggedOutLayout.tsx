import { gql, useQuery } from "@apollo/client";
import { type PropsWithChildren } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import AppLogoIcon from "~/components/AppLogoIcon";

interface AuthLayoutProps {
  name?: string;
  title?: string;
  description?: string;
}

const VIEWER_QUERY = gql`
  query ViewerQueryLoginPage {
    viewer {
      user {
        id
      }
    }
  }
`;

export default function AuthSimpleLayout({
  children,
  title,
  description,
}: PropsWithChildren<AuthLayoutProps>) {
  const navigate = useNavigate();
  const { data, loading } = useQuery(VIEWER_QUERY);
  if (data?.viewer?.user != null) {
    return navigate("/profile");
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-4">
            <Link
              to="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md">
                <AppLogoIcon className="size-9 fill-current text-[var(--foreground)] dark:text-white" />
              </div>
              <span className="sr-only">{title}</span>
            </Link>

            <div className="space-y-2 text-center">
              <h1 className="text-xl font-medium">Login to Three Cells</h1>
              <p className="text-muted-foreground text-center text-sm">
                {description}
              </p>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
