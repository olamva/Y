import { gql } from "@apollo/client";

export const REPOST_MUTATION = gql`
  mutation Repost($id: ID!, $type: String!) {
    repost(id: $id, type: $type) {
      originalAuthor {
        id
        username
        profilePicture
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
        profilePicture
      }
      amtLikes
      amtComments
      amtReposts
      imageUrl
      createdAt
    }
  }
`;

export const GET_REPOSTS = gql`
  query GetReposts($id: ID!) {
    getReposts(id: $id) {
      originalAuthor {
        id
        username
        profilePicture
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
        profilePicture
      }
      amtLikes
      amtComments
      amtReposts
      imageUrl
      createdAt
    }
  }
`;
