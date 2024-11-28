import { gql } from "@apollo/client";

export const GET_NOTIFICATIONS = gql`
  query getNotifications($page: Int!, $limit: Int!) {
    getNotifications(page: $page, limit: $limit) {
      id
      type
      recipient {
        id
        username
        profilePicture
        verified
      }
      sender {
        id
        username
        profilePicture
        verified
      }
      createdAt
      postType
      postID
    }
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation deleteNotification($id: ID!) {
    deleteNotification(id: $id) {
      id
    }
  }
`;

export const DELETE_ALL_NOTIFICATIONS = gql`
  mutation deleteAllNotifications {
    deleteAllNotifications {
      id
    }
  }
`;
