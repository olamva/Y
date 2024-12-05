import { IResolvers } from '@graphql-tools/utils';
import { UserInputError } from 'apollo-server-errors';
import { Comment, CommentType } from '../../models/comment';
import { Post, PostType } from '../../models/post';
import { Repost } from '../../models/repost';
import { User } from '../../models/user';

export const repostQueries: IResolvers = {
  Query: {
    getRepostsByUser: async (_, { username, page, limit }) => {
      const user = await User.findOne({ username });
      const REPOSTS_PER_PAGE = limit ?? 10;
      const skip = (page - 1) * REPOSTS_PER_PAGE;
      if (!user) {
        throw new UserInputError('User not found');
      }
      const reposts = await Repost.find({ author: user._id })
        .sort({ repostedAt: -1 })
        .skip(skip)
        .limit(REPOSTS_PER_PAGE)
        .populate('author');

      try {
        const repostedPosts = await Promise.all(
          reposts.map(async (repost) => {
            let originalPost: PostType | CommentType | null = null;
            if (repost.originalType === 'Post') {
              originalPost = await Post.findById(repost.originalID);
            } else if (repost.originalType === 'Comment') {
              originalPost = await Comment.findById(repost.originalID);
            }
            if (!originalPost) {
              throw new Error('Original post not found');
            }
            const originalAuthor = await User.findById(originalPost.author);

            return {
              id: repost._id,
              author: repost.author,
              originalID: originalPost._id,
              originalType: repost.originalType,
              originalAuthor,
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
            };
          })
        );
        return repostedPosts;
      } catch (err) {
        throw new Error('Error fetching reposts by IDs');
      }
    },
  },
};
