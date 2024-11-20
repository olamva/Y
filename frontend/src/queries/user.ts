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
      firstName
      lastName
      biography
      postIds
      likedPostIds
      mentionedPostIds
      repostedPostIds
      commentIds
      likedCommentIds
      mentionedCommentIds
      followers {
        id
        username
        profilePicture
        verified
      }
      following {
        id
        username
        profilePicture
        verified
      }
      profilePicture
      backgroundPicture
      verified
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers($page: Int!) {
    getUsers(page: $page) {
      id
      username
      firstName
      lastName
      biography
      postIds
      likedPostIds
      mentionedPostIds
      repostedPostIds
      commentIds
      likedCommentIds
      mentionedCommentIds
      followers {
        id
        username
        profilePicture
        verified
      }
      following {
        id
        username
        profilePicture
        verified
      }
      profilePicture
      backgroundPicture
      verified
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile(
    $firstName: String
    $lastName: String
    $biography: String
  ) {
    updateProfile(
      firstName: $firstName
      lastName: $lastName
      biography: $biography
    ) {
      id
      firstName
      lastName
      biography
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
        profilePicture
        verified
      }
      following {
        id
        username
        profilePicture
        verified
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
        profilePicture
        verified
      }
      following {
        id
        username
        profilePicture
        verified
      }
    }
  }
`;

export const CHANGE_PROFILE_PICTURE = gql`
  mutation ChangeProfilePicture($file: Upload) {
    changeProfilePicture(file: $file) {
      id
      profilePicture
    }
  }
`;

export const CHANGE_BACKGROUND_PICTURE = gql`
  mutation ChangeBackgroundPicture($file: Upload) {
    changeBackgroundPicture(file: $file) {
      id
      backgroundPicture
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($username: String!) {
    deleteUser(username: $username) {
      id
      username
    }
  }
`;
