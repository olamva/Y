import { gql } from "@apollo/client";

export const GET_COMMENTS = gql`
  query GetComments($postID: ID!, $page: Int!) {
    getComments(postID: $postID, page: $page) {
      id
      parentID
      parentType
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
      createdAt
      imageUrl
    }
  }
`;

export const GET_COMMENT = gql`
  query GetComment($id: ID!) {
    getComment(id: $id) {
      id
      parentID
      parentType
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
      createdAt
      imageUrl
    }
  }
`;

export const GET_COMMENTS_BY_IDS = gql`
  query GetCommentsByIds($ids: [ID!]!, $page: Int!) {
    getCommentsByIds(ids: $ids, page: $page) {
      id
      parentID
      parentType
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
      createdAt
      imageUrl
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment(
    $body: String
    $parentID: ID!
    $parentType: String!
    $file: Upload
  ) {
    createComment(
      body: $body
      parentID: $parentID
      parentType: $parentType
      file: $file
    ) {
      id
      parentID
      parentType
      body
      hashTags
      author {
        id
        username
        firstName
        lastName
        profilePicture
        backgroundPicture
        verified
      }
      createdAt
      imageUrl
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!, $parentID: ID!, $parentType: String!) {
    deleteComment(id: $id, parentID: $parentID, parentType: $parentType) {
      id
      parentID
      parentType
      __typename
    }
  }
`;

export const EDIT_COMMENT = gql`
  mutation EditComment($id: ID!, $body: String, $file: Upload) {
    editComment(id: $id, body: $body, file: $file) {
      id
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
  mutation UnlikeComment($id: ID!) {
    unlikeComment(id: $id) {
      id
      amtLikes
    }
  }
`;
