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
