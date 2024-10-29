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
