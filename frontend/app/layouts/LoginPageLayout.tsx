import { Authenticated, Unauthenticated } from "convex/react";
import { type PropsWithChildren } from "react";
import { Link, Navigate, Outlet } from "react-router";
import AppLogoIcon from "~/components/AppLogoIcon";
import FullscreenSpinner from "~/components/FullscreenSpinner";

interface AuthLayoutProps {
  name?: string;
  title?: string;
  description?: string;
}

export default function AuthSimpleLayout({
  title,
  description,
}: PropsWithChildren<AuthLayoutProps>) {
  return (
    <>
      <Unauthenticated>
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
      </Unauthenticated>
      <Authenticated>
        <Navigate to="/tasks" replace />
      </Authenticated>
    </>
  );
}
