import { Button } from "~/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import type { Route } from "./+types/index";
import GoogleLogo from "./components/GoogleLogo";
import AppleLogo from "~/components/AppleLogo";
import { useState } from "react";
import { Loader2, Calendar, Flame, TrendingUp, Zap } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login | Three Cells" },
    { name: "description", content: "Get started with Three Cells" },
  ];
}

function FeatureShowcase() {
  const features = [
    {
      icon: Calendar,
      title: "Daily Journaling",
      description:
        "Reflect on your day with simple prompts and rate how you felt",
    },
    {
      icon: Flame,
      title: "Build Habits",
      description: "Track streaks and visualize your consistency with heatmaps",
    },
    {
      icon: TrendingUp,
      title: "Track Metrics",
      description:
        "Monitor anything from weight to study hours with interactive graphs",
    },
    {
      icon: Zap,
      title: "Beautifully Minimal",
      description:
        "No clutter. Just the essentials designed with intentionality",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <div
            key={feature.title}
            className="bg-card border border-border rounded-lg p-4 hover:border-border/70 transition-colors"
          >
            <div className="flex flex-row md:flex-col items-center md:items-start gap-3 mb-2">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-foreground text-sm">
                {feature.title}
              </h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        );
      })}
    </div>
  );
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
            <span className="absolute -top-2 -right-2 z-10 bg-sky-600 text-white text-xs px-2 py-0.5 rounded-sm">
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
      <div className="mt-4">
        <FeatureShowcase />
      </div>
    </main>
  );
}
