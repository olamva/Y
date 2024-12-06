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
          firstName
          lastName
          profilePicture
          backgroundPicture
          verified
        }
        amtLikes
        amtComments
        amtReposts
        createdAt
        imageUrl
      }
    }
  }
`;

export const SEARCH_USERS = gql`
  query SearchUsers($query: String!, $page: Int!, $limit: Int!) {
    searchUsers(query: $query, page: $page, limit: $limit) {
      ... on User {
        id
        username
        firstName
        lastName
        profilePicture
        backgroundPicture
        verified
      }
    }
  }
`;

export const SEARCH_HASHTAGS = gql`
  query SearchHashtags($query: String!, $page: Int!, $limit: Int!) {
    searchHashtags(query: $query, page: $page, limit: $limit) {
      tag
      count
    }
  }
`;
