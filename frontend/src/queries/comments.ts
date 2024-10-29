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
