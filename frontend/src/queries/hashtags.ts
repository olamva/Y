import { gql } from "@apollo/client";

export const GET_TRENDING_HASHTAGS = gql`
  query GetTrendingHashtags($limit: Int!) {
    getTrendingHashtags(limit: $limit) {
      tag
      count
    }
  }
`;
