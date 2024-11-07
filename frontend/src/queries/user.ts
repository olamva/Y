import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $password: String!) {
    register(username: $username, password: $password)
  }
`;

export const GET_USER_QUERY = gql`
  query GetUser($username: String!) {
    getUser(username: $username) {
      id
      username
      postIds
      likedPostIds
      likedCommentIds
      commentIds
      followers {
        id
        username
      }
      following {
        id
        username
      }
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers($page: Int!) {
    getUsers(page: $page) {
      id
      username
      postIds
      likedPostIds
      likedCommentIds
      commentIds
      followers {
        id
        username
      }
      following {
        id
        username
      }
    }
  }
`;

export const FOLLOW_USER_MUTATION = gql`
  mutation FollowUser($username: String!) {
    followUser(username: $username) {
      id
      username
      followers {
        id
        username
      }
      following {
        id
        username
      }
    }
  }
`;

export const UNFOLLOW_USER_MUTATION = gql`
  mutation UnfollowUser($username: String!) {
    unfollowUser(username: $username) {
      id
      username
      followers {
        id
        username
      }
      following {
        id
        username
      }
    }
  }
`;
