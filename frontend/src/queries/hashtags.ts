import { gql } from "@apollo/client";

export const GET_TRENDING_HASHTAGS = gql`
  query GetTrendingHashtags($page: Int!) {
    getTrendingHashtags(page: $page) {
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
