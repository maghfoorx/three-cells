import { Button } from "~/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import type { Route } from "./+types/index";
import GoogleLogo from "./components/GoogleLogo";
import AppleLogo from "~/components/AppleLogo";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login | Three Cells" },
    { name: "description", content: "Get started with Three Cells" },
  ];
}

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [lastUsedProvider, setLastUsedProvider] = useState<string | null>(
    localStorage.getItem("lastUsedAuthProvider") ?? null,
  );

  const handleSignIn = async (provider: "google" | "apple") => {
    setLoadingProvider(provider);
    // Save the provider as last used
    localStorage.setItem("lastUsedAuthProvider", provider);
    try {
      await signIn(provider, { redirectTo: "/track" });
    } catch (error) {
      setLoadingProvider(null);
      console.error("Sign in error:", error);
    }
  };

  return (
    <main className="flex flex-col gap-2 items-center">
      <div className="flex w-full flex-col gap-4">
        <div className="relative">
          {lastUsedProvider === "google" && (
            <span className="absolute -top-2 -right-2 z-10 bg-sky-600 text-white text-xs px-2 py-0.5 rounded-sm">
              Last used
            </span>
          )}
          <Button
            onClick={() => handleSignIn("google")}
            variant="outline"
            className="w-full gap-2"
            size="lg"
            disabled={loadingProvider !== null}
          >
            {loadingProvider === "google" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <GoogleLogo className="h-5 w-5" />
            )}
            Continue with Google
          </Button>
        </div>

        <div className="relative">
          {lastUsedProvider === "apple" && (
            <span className="absolute -top-2 -right-2 z-10 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
              Last used
            </span>
          )}
          <Button
            onClick={() => handleSignIn("apple")}
            variant="outline"
            className="w-full gap-2"
            size="lg"
            disabled={loadingProvider !== null}
          >
            {loadingProvider === "apple" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <AppleLogo />
            )}
            Continue with Apple
          </Button>
        </div>
      </div>
    </main>
  );
}
