import { gql } from "@apollo/client";

export const ROOT_APP_QUERY = gql`
  query RootAppQuery {
    viewer {
      id
      user {
        id
        email
        name
      }
    }
  }
`;

export const LOGOUT_MUTATION_QUERY = gql`
  mutation Logout {
    logout {
      success
      user {
        id
      }
    }
  }
`;
