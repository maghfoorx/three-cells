import { gql, useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { LOGOUT_MUTATION_QUERY } from "~/lib/globalQueries";
import { showErrorToast } from "~/lib/showErrorToast";

const CHANGE_NAME_MUTATION = gql`
  mutation ChangeName($updatedName: String!) {
    changeName(updatedName: $updatedName) {
      id
      email
      name
    }
  }
`;

export default function SettingsPage() {
  const navigate = useNavigate();
  const { data } = useQuery(
    gql`
      query ProfilePageQuery {
        viewer {
          isAuthenticated
          user {
            id
            name
            image
          }
        }
      }
    `,
    {
      onError: (error) => {
        console.error(error, "useQueryError");
      },
    }
  );

  const viewer = data?.viewer ?? null;

  const [changeNameMutation] = useMutation(CHANGE_NAME_MUTATION);
  const [changeNameValue, setChangeNameValue] = useState("");

  const handleChangeName = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await changeNameMutation({ variables: { updatedName: changeNameValue } });
  };

  return (
    <div className="flex h-full flex-1 flex-col gap-4 rounded-xl rounded-t-none p-4">
      <h1>Settings</h1>
      <div>Nothing to show here yet</div>
    </div>
  );
}
