import { Button } from "~/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import type { Route } from "./+types/index";
import GoogleLogo from "./components/GoogleLogo";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login | Three Cells" },
    { name: "description", content: "Get started with Three Cells" },
  ];
}

export default function LoginPage() {
  const { signIn } = useAuthActions();

  return (
    <main className="flex flex-col gap-2 items-center">
      <div className="flex w-full flex-col gap-4">
        <Button
          onClick={() => void signIn("google", { redirectTo: "/tasks" })}
          variant="outline"
          className="w-full gap-2"
          size={"lg"}
        >
          <GoogleLogo className="h-5 w-5" />
          Continue with Google
        </Button>
      </div>
    </main>
  );
}
