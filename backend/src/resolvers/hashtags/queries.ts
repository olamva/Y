import { IResolvers } from '@graphql-tools/utils';
import { UserInputError } from 'apollo-server-errors';
import { Comment } from '../../models/comment';
import { Post } from '../../models/post';

export const hashtagQueries: IResolvers = {
  Query: {
    searchHashtags: async (_, { query, page, limit }) => {
      if (query.length > 40) {
        throw new UserInputError('Query can be a maximum of 40 characters.');
      }

      const PAGE_SIZE = limit || 10;
      const pageNumber = parseInt(page, 10);
      if (isNaN(pageNumber) || pageNumber < 1) {
        throw new UserInputError('Page must be a positive integer.');
      }
      const skip = (pageNumber - 1) * PAGE_SIZE;

      const modifiedQuery = query.startsWith('#') ? query.slice(1) : query;

      try {
        const postHashtags = await Post.aggregate([
          { $unwind: '$hashTags' },
          {
            $match: {
              hashTags: { $regex: modifiedQuery, $options: 'i' },
            },
          },
          {
            $group: {
              _id: '$hashTags',
              count: { $sum: 1 },
            },
          },
        ]);

        const commentHashtags = await Comment.aggregate([
          { $unwind: '$hashTags' },
          {
            $match: {
              hashTags: { $regex: modifiedQuery, $options: 'i' },
            },
          },
          {
            $group: {
              _id: '$hashTags',
              count: { $sum: 1 },
            },
          },
        ]);

        const combined = [...postHashtags, ...commentHashtags];
        const hashtagMap = new Map<string, number>();

        combined.forEach((item) => {
          const tag = item._id;
          const count = item.count;
          if (hashtagMap.has(tag)) {
            hashtagMap.set(tag, hashtagMap.get(tag)! + count);
          } else {
            hashtagMap.set(tag, count);
          }
        });

        const sortedHashtags = Array.from(hashtagMap, ([tag, count]) => ({
          tag,
          count,
        })).sort((a, b) => b.count - a.count);

        const paginatedHashtags = sortedHashtags.slice(skip, skip + PAGE_SIZE);

        return paginatedHashtags;
      } catch (err) {
        console.error('Search Hashtags Error:', err);
        throw new Error('Error performing hashtag search.');
      }
    },
    getTrendingHashtags: async (_, { page, limit = 16 }, context) => {
      const pageNumber = parseInt(page, 16);

      if (isNaN(pageNumber) || pageNumber < 1) {
        throw new UserInputError('Page must be a positive integer');
      }

      const skip = (pageNumber - 1) * limit;

      try {
        const postHashtags = await Post.aggregate([
          { $unwind: '$hashTags' },
          {
            $group: {
              _id: '$hashTags',
              count: { $sum: 1 },
            },
          },
        ]);

        const commentHashtags = await Comment.aggregate([
          { $unwind: '$hashTags' },
          {
            $group: {
              _id: '$hashTags',
              count: { $sum: 1 },
            },
          },
        ]);

        const combined = [...postHashtags, ...commentHashtags];

        const hashtagMap = new Map();

        combined.forEach((item) => {
          const tag = item._id;
          const count = item.count;
          if (hashtagMap.has(tag)) {
            hashtagMap.set(tag, hashtagMap.get(tag) + count);
          } else {
            hashtagMap.set(tag, count);
          }
        });

        const sortedHashtags = Array.from(hashtagMap, ([tag, count]) => ({
          tag,
          count,
        })).sort((a, b) => {
          if (b.count === a.count) {
            return a.tag.localeCompare(b.tag);
          }
          return b.count - a.count;
        });

        const paginatedHashtags = sortedHashtags.slice(skip, skip + limit);

        return paginatedHashtags;
      } catch (error) {
        console.error('Error fetching trending hashtags:', error);
        throw new Error('Failed to fetch trending hashtags');
      }
    },

    getContentByHashtag: async (_, { hashtag, page }, context) => {
      const PAGE_SIZE = 10;

      try {
        if (!hashtag || typeof hashtag !== 'string') {
          throw new UserInputError('Invalid hashtag provided');
        }

        const skip = (page - 1) * PAGE_SIZE;
        const limit = PAGE_SIZE;

        const postsPromise = Post.find({ hashTags: hashtag }).sort({ createdAt: -1 }).populate('author');

        const commentsPromise = Comment.find({ hashTags: hashtag });

        const [posts, comments] = await Promise.all([postsPromise, commentsPromise]);

        const combined = [...posts, ...comments].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );

        const paginatedResults = combined.slice(skip, skip + limit).filter((item) => item.author);

        return paginatedResults;
      } catch (error) {
        console.error(`Error fetching posts and comments for hashtag "${hashtag}":`, error);
        throw new Error('Failed to fetch posts and comments by hashtag');
      }
    },
  },
};
