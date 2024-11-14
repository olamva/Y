import { gql } from "@apollo/client";

export const GET_TRENDING_HASHTAGS = gql`
  query GetTrendingHashtags($limit: Int!) {
    getTrendingHashtags(limit: $limit) {
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
        author {
          id
          username
        }
        createdAt
        hashTags
        # ... other Post fields
      }
      ... on Comment {
        id
        body
        author {
          id
          username
        }
        parentID
        parentType
        createdAt
        hashTags
        # ... other Comment fields
      }
    }
  }
`;
