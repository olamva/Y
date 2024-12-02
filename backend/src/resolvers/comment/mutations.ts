import { IResolvers } from '@graphql-tools/utils';
import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import { GraphQLUpload } from 'graphql-upload-minimal';
import { SortOrder, Types } from 'mongoose';
import { signToken } from '../../auth';
import { Comment, CommentType } from '../../models/comment';
import { Notification } from '../../models/notification';
import { Post, PostType } from '../../models/post';
import { Repost, RepostType } from '../../models/repost';
import { User, UserType } from '../../models/user';
import { deleteFile, uploadFile } from '../../uploadFile';
import { extractHashtags, extractMentions } from '../../utils';

export const commentMutations: IResolvers = {
  Mutation: {
    editComment: async (_, { id, body, file }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to edit a comment');
      }

      if (body.length < 1 && !file) {
        throw new UserInputError('Comment must have a body or an image');
      }

      const user = await User.findById(context.user.id);
      if (!user) {
        throw new UserInputError('User not found');
      }

      const comment = await Comment.findById(id);
      if (!comment) {
        throw new UserInputError('Comment not found');
      }

      if (!comment.author.equals(user.id)) {
        throw new AuthenticationError('You are not authorized to edit this comment');
      }

      if (body.length > 281 && user.verified !== 'VERIFIED' && user.verified !== 'DEVELOPER') {
        throw new UserInputError('Post body exceeds 281 characters');
      }

      if (body.length > 562 && (user.verified === 'VERIFIED' || user.verified === 'DEVELOPER')) {
        throw new UserInputError('Post body exceeds 562 characters');
      }

      let imageUrl: string | undefined = undefined;

      if (!file && comment.imageUrl) {
        imageUrl = comment.imageUrl;
      }

      if (file) {
        try {
          const result = await uploadFile(file);
          imageUrl = result.url;
        } catch (err) {
          throw new Error('Error uploading file');
        }
      }

      const hashTags = body ? extractHashtags(body) : undefined;
      const mentionedUsers = body ? await extractMentions(body) : undefined;

      if (!comment.originalBody) comment.originalBody = comment.body;
      if (comment.originalBody === body) comment.originalBody = undefined;

      comment.body = body;
      comment.imageUrl = imageUrl;
      comment.hashTags = hashTags;

      if (
        mentionedUsers &&
        mentionedUsers.length > 0 &&
        comment.mentionedUsers &&
        comment.mentionedUsers.length > 0
      ) {
        mentionedUsers
          .filter((id) => !comment.mentionedUsers?.includes(id))
          .forEach(async (id) => {
            const user = await User.findById(id);
            if (!user) return;
            user.mentionedCommentIds.push(comment.id);

            if (user.id.toString() !== comment.author._id.toString()) {
              const notification = new Notification({
                type: 'MENTION',
                postType: 'reply',
                postID: comment.id,
                recipient: user,
                sender: comment.author,
              });

              await notification.save();
            }

            return await user.save();
          });
        comment.mentionedUsers
          .filter((id) => !mentionedUsers.includes(id))
          .forEach(async (id) => {
            const user = await User.findById(id);
            if (!user) return;
            user.mentionedCommentIds = user.mentionedCommentIds.filter((postId) => postId !== comment.id);

            if (user.id.toString() !== comment.author._id.toString()) {
              await Notification.findOneAndDelete({
                type: 'MENTION',
                postType: 'reply',
                postID: comment.id,
                recipient: user,
                sender: comment.author,
              });
            }

            return await user.save();
          });
      }
      comment.mentionedUsers = mentionedUsers;

      await comment.save();

      return await comment.populate('author');
    },

    createComment: async (_, { body, parentID, parentType, file }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to create a comment');
      }

      if (body.length < 1 && !file) {
        throw new UserInputError('Comment must have a body or an image');
      }

      if (!user) {
        throw new UserInputError('User not found');
      }

      if (body.length > 281 && user.verified !== 'VERIFIED' && user.verified !== 'DEVELOPER') {
        throw new UserInputError('Post body exceeds 281 characters');
      }

      if (body.length > 562 && (user.verified === 'VERIFIED' || user.verified === 'DEVELOPER')) {
        throw new UserInputError('Post body exceeds 562 characters');
      }

      let imageUrl = null;

      if (file) {
        try {
          const result = await uploadFile(file);
          imageUrl = result.url;
        } catch (err) {
          throw new Error('Error uploading file');
        }
      }
      const hashTags = body ? extractHashtags(body) : [];
      const mentionedUsers = body ? await extractMentions(body) : [];

      try {
        const newComment = new Comment({
          body,
          author: user.id,
          parentID,
          parentType,
          imageUrl,
          hashTags,
          mentionedUsers,
        });
        const savedComment = await newComment.save();

        let parent: PostType | CommentType | null = null;
        if (parentType === 'post') {
          parent = await Post.findByIdAndUpdate(parentID, { $inc: { amtComments: 1 } });
        } else {
          parent = await Comment.findByIdAndUpdate(parentID, { $inc: { amtComments: 1 } });
        }

        user.commentIds.push(savedComment.id);
        await user.save();

        if (mentionedUsers) {
          mentionedUsers.forEach(async (id) => {
            const user = await User.findById(id);
            if (!user) return;
            user.mentionedCommentIds.push(savedComment.id);

            if (user.id !== savedComment.author.id) {
              const notification = new Notification({
                type: 'MENTION',
                postType: 'reply',
                postID: savedComment.id,
                recipient: user,
                sender: savedComment.author,
              });

              await notification.save();
            }

            return await user.save();
          });
        }

        if (parent && user._id.toString() !== parent.author._id.toString()) {
          const notification = new Notification({
            type: 'COMMENT',
            postType: savedComment.parentType.toLowerCase(),
            postID: parent._id,
            recipient: parent.author,
            sender: user,
          });

          await notification.save();
        }

        return await savedComment.populate('author');
      } catch (err) {
        throw new Error('Error creating comment');
      }
    },

    deleteComment: async (_, { id, parentID, parentType }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to delete a comment');
      }

      const user = await User.findById(context.user.id);

      if (!user) {
        throw new UserInputError('User not found');
      }

      if (!user.commentIds.includes(id) && user.username !== 'admin') {
        throw new AuthenticationError('You are not authorized to delete this comment');
      }

      try {
        const deletedComment = await Comment.findByIdAndDelete(id);
        if (!deletedComment) {
          throw new Error('Comment not found');
        }

        if (deletedComment.imageUrl) {
          const deleteResult = await deleteFile(deletedComment.imageUrl);
          if (!deleteResult.success) {
            console.warn(`Failed to delete file: ${deleteResult.message}`);
          }
        }

        let parent: PostType | CommentType | null = null;
        if (parentType === 'post') {
          parent = await Post.findByIdAndUpdate(parentID, { $inc: { amtComments: -1 } });
        } else {
          parent = await Comment.findByIdAndUpdate(parentID, { $inc: { amtComments: -1 } });
        }

        user.commentIds = user.commentIds.filter(
          (commentId) => String(commentId) !== String(deletedComment.id)
        );

        deletedComment.mentionedUsers?.forEach(async (id) => {
          const user = await User.findById(id);

          if (!user) return;

          user.mentionedCommentIds = user.mentionedCommentIds.filter(
            (commentId) => String(commentId) !== String(deletedComment.id)
          );

          if (user.id.toString() !== deletedComment.author._id.toString()) {
            await Notification.findOneAndDelete({
              type: 'MENTION',
              postType: 'reply',
              postID: deletedComment._id,
              recipient: user,
              sender: deletedComment.author,
            });
          }
          return;
        });

        await user.save();

        if (parent && parent.author._id.toString() !== user.id.toString()) {
          await Notification.findOneAndDelete({
            type: 'COMMENT',
            postType: deletedComment.parentType.toLowerCase(),
            postID: parent._id,
            sender: user,
            recipient: parent.author,
          });
        }

        return deletedComment;
      } catch (err) {
        throw new Error(`Error deleting comment: ${(err as Error).message}`);
      }
    },

    likeComment: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to like a comment');
      }

      const comment = await Comment.findById(id);
      if (!comment) {
        throw new UserInputError('Comment not found');
      }

      const user = await User.findById(context.user.id);
      if (!user) {
        throw new UserInputError('User not found');
      }

      if (!user.likedCommentIds.includes(id)) {
        comment.amtLikes += 1;
        user.likedCommentIds.push(id);
        await comment.save();
        await user.save();
      }

      if (comment.author._id.toString() !== user.id.toString()) {
        const notification = new Notification({
          type: 'LIKE',
          postType: 'reply',
          postID: id,
          recipient: comment.author,
          sender: user,
        });

        await notification.save();
      }

      return await comment.populate('author');
    },

    unlikeComment: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to unlike a comment');
      }

      const comment = await Comment.findById(id);
      if (!comment) {
        throw new UserInputError('Comment not found');
      }

      const user = await User.findById(context.user.id);
      if (!user) {
        throw new UserInputError('User not found');
      }

      const likedIndex = user.likedCommentIds.indexOf(id);
      if (likedIndex > -1) {
        comment.amtLikes = Math.max(comment.amtLikes - 1, 0);
        user.likedCommentIds.splice(likedIndex, 1);
        await comment.save();
        await user.save();
      }

      if (comment.author._id.toString() !== user.id.toString()) {
        await Notification.findOneAndDelete({
          type: 'LIKE',
          postType: 'reply',
          postID: id,
          sender: user,
        });
      }

      return await comment.populate('author');
    },
  },
};
