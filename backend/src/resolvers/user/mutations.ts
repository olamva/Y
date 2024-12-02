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

export const userMutations: IResolvers = {
  Mutation: {
    updateProfile: async (_, { firstName, lastName, biography }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to update profile');
      }

      const user = await User.findById(context.user.id);

      if (!user) {
        throw new UserInputError('User not found');
      }

      if (firstName && firstName.length > 20) {
        throw new UserInputError('First name must be at most 20 characters');
      }
      if (lastName && lastName.length > 20) {
        throw new UserInputError('Last name must be at most 20 characters');
      }

      if (biography && biography.length > 160) {
        throw new UserInputError('Biography must be at most 160 characters');
      }

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (biography) user.biography = biography;

      await user.save();

      return user;
    },
    changeProfilePicture: async (_, { file }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to change profile picture');
      }

      const user = await User.findById(context.user.id);

      if (!user) {
        throw new UserInputError('User not found');
      }

      if (user.profilePicture) {
        const deleteResult = await deleteFile(user.profilePicture);
        if (!deleteResult.success) {
          console.warn(`Failed to delete file: ${deleteResult.message}`);
        }
      }

      if (file) {
        try {
          const result = await uploadFile(file, user.username);
          user.profilePicture = result.url;
        } catch (err) {
          throw new Error('Error uploading file');
        }
      } else {
        user.profilePicture = undefined;
      }

      await user.save();
      return user;
    },

    changeBackgroundPicture: async (_, { file }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to change background picture');
      }

      const user = await User.findById(context.user.id);

      if (!user) {
        throw new UserInputError('User not found');
      }

      if (user.backgroundPicture) {
        const deleteResult = await deleteFile(user.backgroundPicture);
        if (!deleteResult.success) {
          console.warn(`Failed to delete file: ${deleteResult.message}`);
        }
      }

      if (file) {
        try {
          const result = await uploadFile(file);
          user.backgroundPicture = result.url;
        } catch (err) {
          throw new Error('Error uploading file');
        }
      } else {
        user.backgroundPicture = undefined;
      }

      await user.save();
      return user;
    },
  },
  register: async (_, { username, password }) => {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      throw new Error('Username already exists');
    }

    if (username.length < 3 || password.length < 6) {
      throw new Error('Username must be at least 3 characters and password must be at least 6 characters');
    }

    if (username.length > 20 || password.length > 20) {
      throw new Error('Username and password must be at most 20 characters');
    }

    const usernameRegex = /^[a-zA-Z0-9_æøåÆØÅ]+$/;
    if (!usernameRegex.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores.');
    }

    const user = new User({ username, password });
    await user.save();
    const token = signToken(user);
    return token;
  },

  login: async (_, { username, password }) => {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const valid = await user.comparePassword(password);
    if (!valid) {
      throw new Error('Invalid credentials');
    }
    const token = signToken(user);
    return token;
  },

  deleteUser: async (_, { username }, context) => {
    if (!context.user) {
      throw new AuthenticationError('You must be logged in to delete a user');
    }

    const user = await User.findById(context.user.id);
    if (!user) {
      throw new UserInputError('User not found');
    }

    if ((user.username !== username && user.username !== 'admin') || username === 'admin') {
      throw new AuthenticationError('You are not authorized to delete this user');
    }

    try {
      const deletedUser = await User.findOneAndDelete({ username });
      if (!deletedUser) {
        throw new Error('User not found');
      }

      const userPosts = await Post.find({ author: deletedUser.id });
      const userComments = await Comment.find({ author: deletedUser.id });
      const userReposts = await Repost.find({ author: deletedUser.id });
      await Notification.deleteMany({ recipient: deletedUser.id });
      await Notification.deleteMany({ sender: deletedUser.id });

      for (const post of userPosts) {
        if (post.imageUrl) {
          const deleteResult = await deleteFile(post.imageUrl);
          if (!deleteResult.success) {
            console.warn(`Failed to delete file: ${deleteResult.message}`);
          }
        }

        if (post.mentionedUsers) {
          post.mentionedUsers.forEach(
            async (id) => await User.findByIdAndUpdate(id, { $pull: { mentionedPostIds: post.id } })
          );
        }

        if (post.amtLikes > 0) {
          await User.updateMany({ $pull: { likedPostIds: post.id } });
        }

        if (post.amtReposts > 0) {
          await User.updateMany({ $pull: { repostedPostIds: post.id } });
          await Repost.deleteMany({ originalID: post._id });
        }
      }

      for (const comment of userComments) {
        if (comment.imageUrl) {
          const deleteResult = await deleteFile(comment.imageUrl);
          if (!deleteResult.success) {
            console.warn(`Failed to delete file: ${deleteResult.message}`);
          }
        }

        if (comment.mentionedUsers) {
          comment.mentionedUsers.forEach(
            async (id) => await User.findByIdAndUpdate(id, { $pull: { mentionedCommentIds: comment.id } })
          );
        }

        if (comment.parentType === 'post') {
          await Post.findByIdAndUpdate(comment.parentID, { $inc: { amtComments: -1 } });
        } else {
          await Comment.findByIdAndUpdate(comment.parentID, { $inc: { amtComments: -1 } });
        }

        if (comment.amtLikes > 0) {
          await User.updateMany({ $pull: { likedCommentIds: comment.id } });
        }
      }

      for (const repost of userReposts) {
        const originalPost = await Post.findById(repost.originalID);
        if (!originalPost) {
          throw new Error('Original post not found');
        }

        originalPost.amtReposts -= 1;
        await originalPost.save();

        await User.findByIdAndUpdate(repost.author, { $pull: { repostedPostIds: repost.originalID } });
      }

      await Post.deleteMany({ author: deletedUser.id });
      await Comment.deleteMany({ author: deletedUser.id });
      await Repost.deleteMany({ author: deletedUser.id });

      if (deletedUser.profilePicture) {
        const deleteResult = await deleteFile(deletedUser.profilePicture);
        if (!deleteResult.success) {
          console.warn(`Failed to delete file: ${deleteResult.message}`);
        }
      }

      if (deletedUser.backgroundPicture) {
        const deleteResult = await deleteFile(deletedUser.backgroundPicture);
        if (!deleteResult.success) {
          console.warn(`Failed to delete file: ${deleteResult.message}`);
        }
      }

      return deletedUser;
    } catch (err) {
      throw new Error(`Error deleting user: ${(err as Error).message}`);
    }
  },
  followUser: async (_, { username }, context) => {
    if (!context.user) {
      throw new AuthenticationError('You must be logged in to follow a user');
    }
    const personToFollow = await User.findOne({ username });
    const user = await User.findById(context.user.id);
    if (!personToFollow || !user) {
      throw new UserInputError('User not found');
    }
    if (user.username === username) {
      throw new UserInputError('You cannot follow yourself');
    }

    if (user.following.includes(personToFollow.id)) {
      throw new UserInputError('You are already following this user');
    }

    personToFollow.followers.push(user.id);
    user.following.push(personToFollow.id);

    await personToFollow.save();
    await user.save();

    const notification = new Notification({
      type: 'FOLLOW',
      recipient: personToFollow,
      sender: user,
    });

    await notification.save();

    return personToFollow;
  },

  unfollowUser: async (_, { username }, context) => {
    if (!context.user) {
      throw new AuthenticationError('You must be logged in to unfollow a user');
    }

    if (context.user.username === username) {
      throw new UserInputError('You cannot unfollow yourself');
    }

    const personToUnfollow = await User.findOne({ username });
    const user = await User.findById(context.user.id);

    if (!personToUnfollow || !user) {
      throw new UserInputError('User not found');
    }

    if (!user.following.includes(personToUnfollow.id)) {
      throw new UserInputError('You are not following this user');
    }

    user.following = user.following.filter((id) => !id.equals(personToUnfollow.id));

    personToUnfollow.followers = personToUnfollow.followers.filter((id) => !id.equals(user.id));

    await personToUnfollow.save();
    await user.save();

    await Notification.findOneAndDelete({
      type: 'FOLLOW',
      recipient: personToUnfollow,
      sender: user,
    });

    return personToUnfollow;
  },
};
