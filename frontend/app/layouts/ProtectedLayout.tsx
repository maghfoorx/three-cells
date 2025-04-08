import { Outlet } from "react-router";
import axios from "axios";
import { redirect } from "react-router";
import { getCookieValue } from "~/lib/getCookieValue";

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

export async function loader({ request }: { request: Request }) {
  const rawCookie = request.headers.get("cookie");
  const xsrfToken = getCookieValue(rawCookie, "XSRF-TOKEN");
  if (xsrfToken == null) {
    return redirect("/login");
  }

  const query = `
    query {
      viewer {
        user {
          id
          name
          email
          image
        }
        isAuthenticated
      }
    }
  `;

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
    if (user == null) {
      const headers = new Headers();
      headers.append(
        "Set-Cookie",
        `laravel_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure`
      );
      headers.append(
        "Set-Cookie",
        `XSRF-TOKEN=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure`
      );
      return redirect("/", { headers });
    }

    return {
      viewer: response.data.data.viewer,
    };
  } catch (error: any) {
    // For any error just redirect to login page with reset session and XSRF token
    if (error?.response != null) {
      console.log("error occured in ProtectedLayout loader");
      const headers = new Headers();
      headers.append(
        "Set-Cookie",
        `laravel_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure`
      );
      headers.append(
        "Set-Cookie",
        `XSRF-TOKEN=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure`
      );
      return redirect("/", { headers });
    }
  }
}

export default function ProtectedLayout({
  loaderData,
}: {
  loaderData: { viewer: any };
}) {
  return (
    <main>
      <Outlet context={{ viewer: loaderData.viewer }} />
    </main>
  );
}
