import { gql } from "@apollo/client";

export const GET_COMMENTS = gql`
  query GetComments($postID: ID!, $page: Int!) {
    getComments(postID: $postID, page: $page) {
      id
      parentID
      body
      author
      amtLikes
      amtComments
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
      amtComments
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

export const LIKE_COMMENT = gql`
  mutation LikeComment($id: ID!) {
    likeComment(id: $id) {
      id
      amtLikes
    }
  }
`;

export const UNLIKE_COMMENT = gql`
  mutation UnlikePost($id: ID!) {
    unlikePost(id: $id) {
      id
      amtLikes
    }
  }
`;
