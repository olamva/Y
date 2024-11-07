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
      imageUrl
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
      imageUrl
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($body: String!, $parentID: ID!, $file: Upload) {
    createComment(body: $body, parentID: $parentID, file: $file) {
      id
      parentID
      body
      author
      createdAt
      imageUrl
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
