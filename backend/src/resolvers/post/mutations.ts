import { IResolvers } from '@graphql-tools/utils';
import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import { Notification } from '../../models/notification';
import { Post } from '../../models/post';
import { Repost } from '../../models/repost';
import { User } from '../../models/user';
import { deleteFile, uploadFile } from '../../uploadFile';
import { extractHashtags, extractMentions } from '../../utils';

export const postMutations: IResolvers = {
  Mutation: {
    createPost: async (_, { body, file }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to create a post');
      }

      if (body.length < 1 && !file) {
        throw new UserInputError('Comment must have a body or an image');
      }

      const user = await User.findById(context.user.id);

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
        const newPost = new Post({ body, author: user.id, imageUrl, hashTags, mentionedUsers });
        const savedPost = await newPost.save();

        user.postIds.push(savedPost.id);
        await user.save();

        if (mentionedUsers && mentionedUsers.length > 0) {
          mentionedUsers.forEach(async (id) => {
            const user = await User.findById(id);
            if (!user) return;
            user.mentionedPostIds.push(savedPost.id);

            if (user.id.toString() !== savedPost.author._id.toString()) {
              const notification = new Notification({
                type: 'MENTION',
                postType: 'post',
                postID: savedPost.id,
                recipient: user,
                sender: savedPost.author,
              });

              await notification.save();
            }

            return await user.save();
          });
        }

        user.followers.forEach(async (follower) => {
          const notification = new Notification({
            type: 'FOLLOWING_POST',
            postType: 'post',
            postID: savedPost.id,
            recipient: follower,
            sender: user,
          });

          await notification.save();
        });

        return await savedPost.populate('author');
      } catch (err) {
        throw new Error('Error creating post');
      }
    },
    editPost: async (_, { id, body, file }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to edit a post');
      }

      if (body.length < 1 && !file) {
        throw new UserInputError('Comment must have a body or an image');
      }

      const user = await User.findById(context.user.id);
      if (!user) {
        throw new UserInputError('User not found');
      }

      const post = await Post.findById(id);
      if (!post) {
        throw new UserInputError('Post not found');
      }

      if (!post.author.equals(user.id)) {
        throw new AuthenticationError('You are not authorized to edit this post');
      }

      if (body.length > 281 && user.verified !== 'VERIFIED' && user.verified !== 'DEVELOPER') {
        throw new UserInputError('Post body exceeds 281 characters');
      }

      if (body.length > 562 && (user.verified === 'VERIFIED' || user.verified === 'DEVELOPER')) {
        throw new UserInputError('Post body exceeds 562 characters');
      }

      let imageUrl: string | undefined = undefined;

      if (!file && post.imageUrl) {
        imageUrl = post.imageUrl;
      }

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

      if (!post.originalBody) post.originalBody = post.body;
      if (post.originalBody === body) post.originalBody = undefined;

      post.body = body;
      post.imageUrl = imageUrl;
      post.hashTags = hashTags;

      if (mentionedUsers && post.mentionedUsers && mentionedUsers.length !== post.mentionedUsers.length) {
        mentionedUsers
          .filter((id) => !post.mentionedUsers?.includes(id))
          .forEach(async (id) => {
            const user = await User.findById(id);
            if (!user) return;
            user.mentionedPostIds.push(post.id);

            if (user.id.toString() !== post.author._id.toString()) {
              const notification = new Notification({
                type: 'MENTION',
                postType: 'post',
                postID: post.id,
                recipient: user,
                sender: post.author,
              });

              await notification.save();
            }

            return await user.save();
          });
        post.mentionedUsers
          ?.filter((id) => !mentionedUsers.includes(id))
          .forEach(async (id) => {
            const user = await User.findById(id);
            if (!user) return;
            user.mentionedPostIds = user.mentionedPostIds.filter((postId) => postId !== post.id);

            if (user.id.toString() !== post.author._id.toString()) {
              await Notification.findOneAndDelete({
                type: 'MENTION',
                postType: 'post',
                postID: post.id,
                recipient: user,
                sender: post.author,
              });
            }

            return await user.save();
          });
      }
      post.mentionedUsers = mentionedUsers;
      await post.save();

      return await post.populate('author');
    },
    deletePost: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to delete a post');
      }

      const user = await User.findById(context.user.id);

      if (!user) {
        throw new UserInputError('User not found');
      }

      if (!user.postIds.includes(id) && user.username !== 'admin') {
        throw new AuthenticationError('You are not authorized to delete this post');
      }

      try {
        const deletedPost = await Post.findByIdAndDelete(id);
        if (!deletedPost) {
          throw new Error('Post not found');
        }

        if (deletedPost.imageUrl) {
          const deleteResult = await deleteFile(deletedPost.imageUrl);
          if (!deleteResult.success) {
            console.warn(`Failed to delete file: ${deleteResult.message}`);
          }
        }

        if (deletedPost.amtReposts > 0) {
          await User.updateMany({ $pull: { repostedPostIds: deletedPost.id } });
          await Repost.deleteMany({ originalID: deletedPost.id });
        }

        if (deletedPost.amtLikes > 0) {
          await User.updateMany({ $pull: { likedPostIds: deletedPost.id } });
          await Notification.deleteMany({
            type: 'LIKE',
            postType: 'post',
            postID: deletedPost.id,
          });
        }

        user.postIds = user.postIds.filter((postId) => String(postId) !== String(deletedPost.id));

        deletedPost.mentionedUsers?.forEach(async (id) => {
          const mentionedUser = await User.findById(id);

          if (!mentionedUser) return;

          mentionedUser.mentionedPostIds = mentionedUser.mentionedPostIds.filter((postID) => {
            return postID !== deletedPost.id.toString();
          });

          await mentionedUser.save();

          if (mentionedUser.id.toString() !== deletedPost.author._id.toString()) {
            await Notification.findOneAndDelete({
              type: 'MENTION',
              postType: 'post',
              postID: deletedPost._id,
              recipient: mentionedUser,
              sender: deletedPost.author,
            });
          }
          return;
        });

        await user.save();

        await Notification.deleteMany({
          postType: 'post',
          postID: deletedPost._id,
        });

        return deletedPost;
      } catch (err) {
        throw new Error(`Error deleting post: ${(err as Error).message}`);
      }
    },
    likePost: async (_, { postID }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to like a post');
      }

      const post = await Post.findById(postID);
      if (!post) {
        throw new UserInputError('Post not found');
      }

      const user = await User.findById(context.user.id);
      if (!user) {
        throw new UserInputError('User not found');
      }

      if (!user.likedPostIds.includes(postID)) {
        post.amtLikes += 1;
        user.likedPostIds.push(postID);
        await post.save();
        await user.save();
      }

      if (post.author._id.toString() !== user.id.toString()) {
        const notification = new Notification({
          type: 'LIKE',
          postType: 'post',
          postID,
          recipient: post.author,
          sender: user,
        });

        await notification.save();
      }

      return await post.populate('author');
    },

    unlikePost: async (_, { postID }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to unlike a post');
      }

      const post = await Post.findById(postID);
      if (!post) {
        throw new UserInputError('Post not found');
      }

      const user = await User.findById(context.user.id);
      if (!user) {
        throw new UserInputError('User not found');
      }

      const likedIndex = user.likedPostIds.indexOf(postID);
      if (likedIndex > -1) {
        post.amtLikes = Math.max(post.amtLikes - 1, 0);
        user.likedPostIds.splice(likedIndex, 1);
        await post.save();
        await user.save();
      }

      if (post.author._id.toString() !== user.id.toString()) {
        await Notification.findOneAndDelete({
          type: 'LIKE',
          postType: 'post',
          postID,
          sender: user,
        });
      }

      return await post.populate('author');
    },
  },
};
