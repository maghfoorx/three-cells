import { Button } from "~/components/ui/button";
import type { Route } from "./+types/index";
import GoogleLogo from "./components/GoogleLogo";
import axios from "axios";
import { showErrorToast } from "~/lib/showErrorToast";
import { getCookieValue } from "~/lib/getCookieValue";
import { redirect } from "react-router";

export async function loader({ request }: { request: Request }) {
  const query = `
      query {
        viewer {
          user {
            id
          }
        }
      }
    `;

  const rawCookie = request.headers.get("cookie");
  const xsrfToken = getCookieValue(rawCookie, "XSRF-TOKEN");

  try {
    const response = await axios.post(
      "http://localhost:8000/graphql",
      { query },
      {
        headers: {
          cookie: rawCookie,
          "X-XSRF-TOKEN": xsrfToken,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    const user = response.data?.data?.viewer?.user ?? null;

    // if the user is not logged in, then just reset the session and XSRF token and redirect to login page
    if (user != null) {
      return redirect("/profile");
    }

    return {
      viewer: response.data.data.viewer,
    };
  } catch (error: any) {
    // For any error just redirect to login page with reset session and XSRF token
    if (error?.response != null) {
      // console.log(error.response, "error");
      console.log("error occured in login page loader.");
    }
  }
}

export default function LoginPage() {
  // const [email, setEmail] = useState("");

  // const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   console.log("runniing");
  //   try {
  //     await axios.get("http://localhost:8000/sanctum/csrf-cookie");

  //     await axios.post(
  //       "http://localhost:8000/login",
  //       {
  //         email,
  //       },
  //       {
  //         withCredentials: true,
  //         withXSRFToken: true,
  //       }
  //     );
  //   } catch (error) {
  //     console.log("error occurred");
  //     console.error(error);
  //   }
  // };

  const handleGoogleLogin = async () => {
    try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie");
      window.location.href = "http://localhost:8000/auth/google";
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
        >
          <GoogleLogo className="h-5 w-5" />
          Continue with Google
        </Button>

        {/* Separator */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">
              Or continue with email
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
