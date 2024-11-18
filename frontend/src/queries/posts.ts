import { gql } from "@apollo/client";

export const GET_POSTS = gql`
  query GetPosts($page: Int!, $filter: PostFilter!) {
    getPosts(page: $page, filter: $filter) {
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
      imageUrl
      createdAt
    }
  }
`;

export const GET_POST = gql`
  query GetPost($id: ID!) {
    getPost(id: $id) {
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
      imageUrl
      createdAt
    }
  }
`;

export const GET_POSTS_BY_IDS = gql`
  query GetPostsByIds($ids: [ID!]!, $page: Int!) {
    getPostsByIds(ids: $ids, page: $page) {
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
      createdAt
      imageUrl
    }
  }
`;

export const CREATE_POST = gql`
  mutation CreatePost($body: String, $file: Upload) {
    createPost(body: $body, file: $file) {
      id
      body
      author {
        id
        username
        profilePicture
      }
      amtLikes
      hashTags
      amtComments
      imageUrl
      createdAt
      __typename
    }
  }
`;

export const EDIT_POST = gql`
  mutation EditPost($id: ID!, $body: String, $file: Upload) {
    editPost(id: $id, body: $body, file: $file) {
      id
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

export const GET_PARENT = gql`
  query GetParent($parentID: ID!, $parentType: String!) {
    getParent(parentID: $parentID, parentType: $parentType) {
      ... on Post {
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
        imageUrl
        createdAt
      }
      ... on Comment {
        id
        parentID
        parentType
        body
        author {
          id
          username
          profilePicture
        }
        amtLikes
        amtComments
        createdAt
        imageUrl
      }
    }
  }
`;

export const GET_PARENTS_BY_IDS = gql`
  query GetParentsByIds($parents: [ParentInput!]!, $page: Int!) {
    getParentsByIds(parents: $parents, page: $page) {
      ... on Post {
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
        imageUrl
        createdAt
      }
      ... on Comment {
        id
        parentID
        parentType
        body
        author {
          id
          username
          profilePicture
        }
        amtLikes
        amtComments
        createdAt
        imageUrl
      }
    }
  }
`;
