import { IResolvers } from '@graphql-tools/utils';
import { UserInputError } from 'apollo-server-errors';
import { SortOrder, Types } from 'mongoose';
import { Comment, CommentType } from '../../models/comment';
import { Post, PostType } from '../../models/post';
import { Repost, RepostType } from '../../models/repost';
import { UserType } from '../../models/user';

export const postQueries: IResolvers = {
  Query: {
    getPosts: async (
      _: any,
      { page = 1, filter = 'LATEST', limit = 10 }: { page: number; filter: string; limit?: number },
      { user }: { user?: UserType }
    ) => {
      const ITEMS_PER_PAGE = limit;
      const skip = (page - 1) * ITEMS_PER_PAGE;

      try {
        let postQuery: any = {};
        let repostQuery: any = {};
        let sort: Record<string, SortOrder> = { createdAt: -1 };
        let includeReposts = true;

        switch (filter) {
          case 'LATEST':
            break;

          case 'FOLLOWING':
            if (!user) {
              break;
            }
            const followingIds = user.following.map((followedUser: Types.ObjectId) => followedUser);
            postQuery.author = { $in: followingIds };
            repostQuery.author = { $in: followingIds };
            break;

          case 'POPULAR':
            sort = { amtLikes: -1, createdAt: -1 };
            includeReposts = false;
            break;

          case 'CONTROVERSIAL':
            sort = { controversyRatio: -1, createdAt: -1 };
            includeReposts = false;
            break;

          default:
            throw new UserInputError('Invalid filter type.');
        }

        const buildPostAggregation = () => {
          const pipeline: any[] = [
            { $match: postQuery },
            {
              $addFields: {
                controversyRatio: {
                  $cond: [{ $eq: ['$amtLikes', 0] }, 0, { $divide: ['$amtComments', '$amtLikes'] }],
                },
              },
            },
            { $sort: sort },
            { $skip: skip },
            { $limit: ITEMS_PER_PAGE },
            {
              $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'author',
              },
            },
            { $unwind: '$author' },
          ];

          return Post.aggregate(pipeline).exec();
        };

        const buildRepostAggregation = () => {
          let repostSort: Record<string, SortOrder> = { repostedAt: -1 };

          if (filter === 'POPULAR') {
            repostSort = { amtLikes: -1, repostedAt: -1 };
          } else if (filter === 'CONTROVERSIAL') {
            repostSort = { controversyRatio: -1, repostedAt: -1 };
          }

          const pipeline: any[] = [
            { $match: repostQuery },
            {
              $facet: {
                repostsOfPosts: [
                  { $match: { originalType: 'Post' } },
                  {
                    $lookup: {
                      from: 'posts',
                      localField: 'originalID',
                      foreignField: '_id',
                      as: 'originalContent',
                    },
                  },
                ],
                repostsOfComments: [
                  { $match: { originalType: 'Comment' } },
                  {
                    $lookup: {
                      from: 'comments',
                      localField: 'originalID',
                      foreignField: '_id',
                      as: 'originalContent',
                    },
                  },
                ],
              },
            },
            {
              $project: {
                reposts: { $concatArrays: ['$repostsOfPosts', '$repostsOfComments'] },
              },
            },
            { $unwind: '$reposts' },
            { $replaceRoot: { newRoot: '$reposts' } },
            { $unwind: '$originalContent' },
            {
              $addFields: {
                controversyRatio: {
                  $cond: [
                    { $eq: ['$originalContent.amtLikes', 0] },
                    0,
                    { $divide: ['$originalContent.amtComments', '$originalContent.amtLikes'] },
                  ],
                },
              },
            },
            { $sort: repostSort },
            { $skip: skip },
            { $limit: ITEMS_PER_PAGE },
            {
              $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'author',
              },
            },
            { $unwind: '$author' },
          ];

          return Repost.aggregate(pipeline).exec();
        };

        let posts: PostType[] | RepostType[] = [];
        let reposts: RepostType[] = [];

        if (includeReposts) {
          const [fetchedPosts, fetchedReposts] = await Promise.all([
            buildPostAggregation(),
            filter !== 'POPULAR' && filter !== 'CONTROVERSIAL'
              ? buildRepostAggregation()
              : Promise.resolve([]),
          ]);

          posts = fetchedPosts;
          reposts = fetchedReposts as RepostType[];
        } else {
          if (filter === 'CONTROVERSIAL' || filter === 'POPULAR') {
            posts = await buildPostAggregation();
          } else {
            posts = (await Post.find(postQuery)
              .sort(sort)
              .skip(skip)
              .limit(ITEMS_PER_PAGE)
              .populate('author')
              .lean()) as PostType[];
          }
        }

        let combinedResults: any[] = [...posts];

        if (includeReposts && reposts.length > 0) {
          const formattedReposts = await Promise.all(
            reposts.map(async (repost) => {
              let originalPost: PostType | CommentType | null = null;
              if (repost.originalType === 'Post') {
                originalPost = (await Post.findById(repost.originalID).populate('author').lean()) as PostType;
              } else if (repost.originalType === 'Comment') {
                originalPost = (await Comment.findById(repost.originalID)
                  .populate('author')
                  .lean()) as CommentType;
              }

              if (!originalPost) {
                throw new Error('Original post not found');
              }

              const controversyRatio = originalPost.amtLikes
                ? originalPost.amtComments / originalPost.amtLikes
                : 0;

              return {
                _id: repost._id,
                type: 'Repost',
                id: repost._id,
                author: repost.author,
                originalID: originalPost._id,
                originalType: repost.originalType,
                originalAuthor: originalPost.author,
                repostedAt: repost.repostedAt,
                body: originalPost.body,
                originalBody: originalPost.originalBody,
                amtLikes: originalPost.amtLikes,
                amtComments: originalPost.amtComments,
                amtReposts: originalPost.amtReposts,
                createdAt: originalPost.createdAt,
                imageUrl: originalPost.imageUrl,
                hashTags: originalPost.hashTags,
                mentionedUsers: originalPost.mentionedUsers,
                parentID: (originalPost as CommentType).parentID,
                parentType: (originalPost as CommentType).parentType,
                controversyRatio: controversyRatio,
              };
            })
          );

          combinedResults = combinedResults.concat(formattedReposts);
        }

        if (filter === 'LATEST' || filter === 'FOLLOWING') {
          combinedResults.sort((a, b) => {
            const dateA = a.repostedAt ? new Date(a.repostedAt) : new Date(a.createdAt);
            const dateB = b.repostedAt ? new Date(b.repostedAt) : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          });
        } else if (filter === 'POPULAR') {
          combinedResults.sort((a, b) => {
            if (b.amtLikes !== a.amtLikes) {
              return b.amtLikes - a.amtLikes;
            } else {
              const dateA = a.repostedAt ? new Date(a.repostedAt) : new Date(a.createdAt);
              const dateB = b.repostedAt ? new Date(b.repostedAt) : new Date(b.createdAt);
              return dateB.getTime() - dateA.getTime();
            }
          });
        } else if (filter === 'CONTROVERSIAL') {
          combinedResults.sort((a, b) => {
            if (b.controversyRatio !== a.controversyRatio) {
              return b.controversyRatio - a.controversyRatio;
            } else {
              const dateA = a.repostedAt ? new Date(a.repostedAt) : new Date(a.createdAt);
              const dateB = b.repostedAt ? new Date(b.repostedAt) : new Date(b.createdAt);
              return dateB.getTime() - dateA.getTime();
            }
          });
        }

        combinedResults = combinedResults.slice(0, ITEMS_PER_PAGE);

        return combinedResults;
      } catch (err) {
        console.error(err);
        throw new Error('Error fetching posts');
      }
    },
    getPost: async (_, { id }) => {
      try {
        const post = await Post.findById(id).populate('author');
        return post;
      } catch (err) {
        throw new Error('Error fetching post');
      }
    },
    getPostsByIds: async (_, { ids, page, limit }) => {
      const POSTS_PER_PAGE = limit ?? 10;
      try {
        const posts = await Post.find({ _id: { $in: ids } })
          .sort({ createdAt: -1 })
          .skip((page - 1) * POSTS_PER_PAGE)
          .limit(limit)
          .populate('author');

        const validPosts = posts.filter((post) => post.author);

        return validPosts;
      } catch (err) {
        throw new Error('Error fetching posts by IDs');
      }
    },
    searchPosts: async (_: any, { query, page }) => {
      if (query.length > 40) {
        throw new UserInputError('Query can max be 40 characters');
      }

      const POSTS_PER_PAGE = 10;
      const pageNumber = parseInt(page, 10);
      if (isNaN(pageNumber) || pageNumber < 1) {
        throw new UserInputError('Page must be a positive integer');
      }
      const skip = (pageNumber - 1) * POSTS_PER_PAGE;

      try {
        const posts = await Post.aggregate([
          {
            $lookup: {
              from: 'users',
              localField: 'author',
              foreignField: '_id',
              as: 'authorDetails',
            },
          },
          { $unwind: '$authorDetails' },
          {
            $match: {
              $or: [
                { body: { $regex: query, $options: 'i' } },
                { 'authorDetails.username': { $regex: query, $options: 'i' } },
              ],
            },
          },
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: POSTS_PER_PAGE },
          {
            $project: {
              id: '$_id',
              body: 1,
              originalBody: 1,
              author: '$authorDetails',
              amtLikes: 1,
              amtComments: 1,
              amtReposts: 1,
              createdAt: 1,
              imageUrl: 1,
            },
          },
        ]);

        return posts;
      } catch (err) {
        console.error('Search Posts Error:', err);
        throw new Error('Error performing search');
      }
    },
    getParent: async (_, { parentID, parentType }) => {
      try {
        if (parentType === 'post') return await Post.findById(parentID).populate('author');
        else return await Comment.findById(parentID).populate('author');
      } catch (err) {
        throw new Error('Error fetching parent');
      }
    },
    getParentsByIds: async (_, { parents }) => {
      const fetchedParents: (PostType | CommentType)[] = [];
      try {
        await Promise.all(
          parents.map(async (parent: { id: string; type: string }) => {
            if (parent.type === 'post') {
              const post = await Post.findById(parent.id).populate('author');
              if (post && post.author) fetchedParents.push(post);
            } else {
              const comment = await Comment.findById(parent.id).populate('author');
              if (comment && comment.author) fetchedParents.push(comment);
            }
          })
        );
        return fetchedParents;
      } catch (err) {
        throw new Error('Error fetching parents');
      }
    },
  },
};
