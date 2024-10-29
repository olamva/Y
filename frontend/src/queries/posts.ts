import { gql } from "@apollo/client";

export const GET_POSTS = gql`
  query GetPosts($page: Int!) {
    getPosts(page: $page) {
      id
      body
      author
      amtLikes
      amtComments
      createdAt
    }
  }
`;

export const GET_POST = gql`
  query GetPost($id: ID!) {
    getPost(id: $id) {
      id
      body
      author
      amtLikes
      amtComments
      createdAt
    }
  }
`;

export const CREATE_POST = gql`
  mutation CreatePost($body: String!) {
    createPost(body: $body) {
      id
      body
      author
      amtLikes
      amtComments
      createdAt
      __typename
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id) {
      id
      __typename
    }
  }
`;

export const LIKE_POST = gql`
  mutation LikePost($postID: ID!) {
    likePost(postID: $postID) {
      id
      amtLikes
    }
  }
`;

export const UNLIKE_POST = gql`
  mutation UnlikePost($postID: ID!) {
    unlikePost(postID: $postID) {
      id
      amtLikes
    }
  }
`;
