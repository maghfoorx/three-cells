import { gql, useMutation, useQuery } from "@apollo/client";
import axios from "axios";
import { useState } from "react";
import { redirect, useNavigate, useOutletContext } from "react-router";
import { Button } from "~/components/ui/button";
import { showErrorToast } from "~/lib/showErrorToast";

export function HydrateFallback() {
  return <div>Loading...</div>;
}

const CHANGE_NAME_MUTATION = gql`
  mutation ChangeName($updatedName: String!) {
    changeName(updatedName: $updatedName) {
      id
      email
      name
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
    }
  }
`;

export default function ProfilePage() {
  // const { viewer: viewerFromOutletContext = null } = useOutletContext<{
  //   viewer: any;
  // }>();

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
    console.log(changeNameValue, "isNameInput");
    await changeNameMutation({ variables: { updatedName: changeNameValue } });
  };

  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  const handleLogout = async () => {
    const { data, errors } = await logoutMutation();
    if (data?.logout?.success) {
      navigate("/");
    } else {
      showErrorToast("Something went wrong. Please try again later.");
    }
  };

  return (
    <div>
      <h1>Profile Page</h1>
      <div className="font-semibold text-xl">
        Your name: {viewer?.user?.name}
      </div>
      <div>{JSON.stringify(viewer, null, 2)}</div>
      <form onSubmit={handleChangeName}>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          className="border"
          value={changeNameValue}
          onChange={(event) => setChangeNameValue(event.target.value)}
        />
        <button type="submit" className="bg-orange-200">
          Update Name
        </button>
      </form>
      <div>
        <Button variant={"destructive"} onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </div>
  );
}
