import { gql } from "@apollo/client";

export const GET_TRENDING_HASHTAGS = gql`
  query GetTrendingHashtags($page: Int!, $limit: Int) {
    getTrendingHashtags(page: $page, limit: $limit) {
      tag
      count
    }
  }
`;

export const GET_CONTENT_BY_HASHTAG = gql`
  query GetContentByHashtag($hashtag: String!, $page: Int!) {
    getContentByHashtag(hashtag: $hashtag, page: $page) {
      ... on Post {
        id
        body
        originalBody
        author {
          id
          username
          firstName
          lastName
          profilePicture
          verified
        }
        amtLikes
        amtComments
        amtReposts
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
          firstName
          lastName
          profilePicture
          verified
        }
        amtLikes
        amtComments
        amtReposts
        createdAt
        imageUrl
      }
    }
  }
`;
