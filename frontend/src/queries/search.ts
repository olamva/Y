import { gql } from "@apollo/client";

export const SEARCH_POSTS = gql`
  query SearchPosts($query: String!, $page: Int!) {
    searchPosts(query: $query, page: $page) {
      ... on Post {
        id
        body
        author {
          id
          username
          profilePicture
        }
        amtLikes
        amtComments
        createdAt
      }
    }
  }
`;

export const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      ... on User {
        id
        username
      }
    }
  }
`;
