import { Button } from "~/components/ui/button";
import type { Route } from "./+types/index";
import GoogleLogo from "./components/GoogleLogo";
import axios from "axios";
import { showErrorToast } from "~/lib/showErrorToast";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login | Three Cells" },
    { name: "description", content: "Get started with Three Cells" },
  ];
}

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_URL}/sanctum/csrf-cookie`);
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    } catch (error) {
      showErrorToast();
      console.error(error);
    }
  };
  return (
    <main className="flex flex-col gap-2 items-center">
      <div className="flex w-full flex-col gap-4">
        <Button
          onClick={handleGoogleLogin}
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
