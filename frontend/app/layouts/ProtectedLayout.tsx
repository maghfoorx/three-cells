import { Outlet, useNavigate } from "react-router";
import { gql, useQuery } from "@apollo/client";

export default function ProtectedLayout({
  loaderData,
}: {
  loaderData: { viewer: any };
}) {
  const navigate = useNavigate();
  const { data } = useQuery(gql`
    query ProtectedLayoutQuery {
      viewer {
        user {
          id
          email
          name
        }
      }
    }
  `);

  if (!data || !data.viewer || !data.viewer.user) {
    return navigate("/login");
  }

  return (
    <main>
      <Outlet context={{ viewer: data.viewer }} />
    </main>
  );
}
