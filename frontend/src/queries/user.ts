import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $password: String!) {
    register(username: $username, password: $password)
  }
`;

export const GET_USER_QUERY = gql`
  query GetUser($username: String!) {
    getUser(username: $username) {
      username
      postIds
      likedPostIds
      commentIds
    }
  }
`;
