import { gql } from "@apollo/client";

export const GET_COMMENTS = gql`
  query GetComments($postID: ID!) {
    getComments(postID: $postID) {
      id
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
      body
      author
      createdAt
    }
  }
`;
