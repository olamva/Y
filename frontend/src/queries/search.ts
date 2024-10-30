import { gql } from "@apollo/client";

export const SEARCH_ALL = gql`
  query SearchAll($query: String!) {
    searchAll(query: $query) {
      ... on Post {
        id
        body
        author
        amtLikes
        amtComments
        createdAt
      }
      ... on User {
        id
        username
      }
    }
  }
`;
