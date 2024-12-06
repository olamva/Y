import { gql } from "@apollo/client";

export const REPOST_MUTATION = gql`
  mutation Repost($id: ID!, $type: String!) {
    repost(id: $id, type: $type) {
      originalAuthor {
        id
        username
        firstName
        lastName
        profilePicture
        backgroundPicture
        verified
      }
      originalID
      originalType
      repostedAt
      id
      body
      originalBody
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
      imageUrl
      createdAt
    }
  }
`;

export const UNREPOST_MUTATION = gql`
  mutation Unrepost($id: ID!) {
    unrepost(id: $id) {
      id
    }
  }
`;

export const GET_REPOSTS_BY_USER = gql`
  query getRepostsByUser($username: String!, $page: Int!, $limit: Int!) {
    getRepostsByUser(username: $username, page: $page, limit: $limit) {
      originalAuthor {
        id
        username
        firstName
        lastName
        profilePicture
        backgroundPicture
        verified
      }
      originalID
      originalType
      repostedAt
      id
      body
      originalBody
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
      imageUrl
      createdAt
      parentID
      parentType
    }
  }
`;
