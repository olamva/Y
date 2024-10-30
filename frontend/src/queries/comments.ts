import { gql } from "@apollo/client";

export const GET_COMMENTS = gql`
  query GetComments($postID: ID!) {
    getComments(postID: $postID) {
      id
      parentID
      body
      author
      amtLikes
      createdAt
    }
  }
`;

export const GET_COMMENTS_BY_IDS = gql`
  query GetCommentsByIds($ids: [ID!]!) {
    getCommentsByIds(ids: $ids) {
      id
      parentID
      body
      author
      amtLikes
      createdAt
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($body: String!, $parentID: ID!) {
    createComment(body: $body, parentID: $parentID) {
      id
      parentID
      body
      author
      createdAt
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id) {
      id
      parentID
      __typename
    }
  }
`;
