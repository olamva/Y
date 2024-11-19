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

export const UNREPOST_MUTATION = gql`
  mutation Unrepost($id: ID!) {
    unrepost(id: $id) {
      id
    }
  }
`;

export const GET_REPOSTS = gql`
  query GetReposts($page: Int!, $filter: PostFilter!, $limit: Int!) {
    getReposts(page: $page, filter: $filter, limit: $limit) {
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
      parentID
      parentType
    }
  }
`;
