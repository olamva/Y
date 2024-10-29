import { IResolvers } from 'graphql-tools';
import { Post } from './models/post';
import { User } from './models/user';
import { Comment } from './models/comment';
import bcrypt from 'bcryptjs';
import { generateToken } from './jwt';

export const resolvers: IResolvers = {
  Query: {
    getPosts: async (_, { page }) => {
      const POSTS_PER_PAGE = 10;
      const skip = (page - 1) * POSTS_PER_PAGE;

      try {
        return await Post.find().sort({ createdAt: -1 }).skip(skip).limit(POSTS_PER_PAGE);
      } catch (err) {
        throw new Error('Error fetching posts');
      }
    },
    getPost: async (_, { id }) => {
      try {
        return await Post.findById(id);
      } catch (err) {
        throw new Error('Error fetching post');
      }
    },
    getUser: async (_, { username }) => {
      try {
        return await User.findOne({ username: username });
      } catch (err) {
        throw new Error('Error fetching user');
      }
    },
    getComments: async (_, { postID }) => {
      try {
        return await Comment.find({ parentId: postID });
      } catch (err) {
        throw new Error('Error fetching comments');
      }
    },
    async searchAll(_: any, { query }: { query: string }) {
      try {
        const posts = await Post.find({
          $or: [{ body: { $regex: query, $options: 'i' } }, { author: { $regex: query, $options: 'i' } }],
        });

        const users = await User.find({
          username: { $regex: query, $options: 'i' },
        });

        return [...users, ...posts];
      } catch (err) {
        throw new Error('Error performing search');
      }
    },

    async searchUsers(_: any, { query }: { query: string }) {
      return await User.find({
        username: { $regex: query, $options: 'i' },
      });
    },
  },

  Mutation: {
    createPost: async (_, { body, author }) => {
      try {
        const newPost = new Post({ body, author });
        return await newPost.save();
      } catch (err) {
        throw new Error('Error creating post');
      }
    },
    register: async (_, { username, password }) => {
      const existingUser = await User.findOne({ username });
      if (existingUser) throw new Error('Username already taken');

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword });
      await newUser.save();

      return generateToken(newUser.id);
    },
    login: async (_, { username, password }) => {
      const user = await User.findOne({ username });
      if (!user) throw new Error('User not found');

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) throw new Error('Invalid credentials');

      return generateToken(user.id);
    },

    createComment: async (_, { body, author, parentID }) => {
      try {
        const newComment = new Comment({ body, author, parentID: parentID });
        return await newComment.save();
      } catch (err) {
        throw new Error('Error creating comment');
      }
    },
    deletePost: async (_, { id }) => {
      try {
        const deletedPost = await Post.findByIdAndDelete(id);
        if (!deletedPost) {
          throw new Error('Post not found');
        }
        await Comment.deleteMany({ parentID: id });

        return deletedPost;
      } catch (err) {
        throw new Error(`Error deleting post and its comments: ${(err as Error).message}`);
      }
    },

    deleteComment: async (_, { id }) => {
      try {
        const deletedComment = await Comment.findByIdAndDelete(id);
        if (!deletedComment) {
          throw new Error('Comment not found');
        }
        return deletedComment;
      } catch (err) {
        throw new Error(`Error deleting comment: ${(err as Error).message}`);
      }
    },
    likePost: async (_, { postID }, { username }) => {
      try {
        const user = await User.findOne({ username });
        if (!user) throw new Error('User not found');

        if (user.likedPostIds.includes(postID)) {
          throw new Error('Post already liked by this user');
        }

        const post = await Post.findById(postID);
        if (!post) throw new Error('Post not found');

        post.amtLikes += 1;
        user.likedPostIds.push(postID);

        await post.save();
        await user.save();

        return post;
      } catch (err) {
        if (err instanceof Error) {
          throw new Error(`Error liking post: ${err.message}`);
        } else {
          throw new Error('Error liking post');
        }
      }
    },
    unlikePost: async (_, { postID }, { username }) => {
      try {
        const user = await User.findOne({ username });
        if (!user) throw new Error('User not found');

        if (!user.likedPostIds.includes(postID)) {
          throw new Error('Post not liked by this user');
        }

        const post = await Post.findById(postID);
        if (!post) throw new Error('Post not found');

        post.amtLikes -= 1;
        user.likedPostIds.push(postID);

        await post.save();
        await user.save();

        return post;
      } catch (err) {
        if (err instanceof Error) {
          throw new Error(`Error liking post: ${err.message}`);
        } else {
          throw new Error('Error liking post');
        }
      }
    },
  },
  SearchResult: {
    __resolveType(obj: any) {
      if (obj.username) {
        return 'User';
      }
      if (obj.body) {
        return 'Post';
      }
      return null;
    },
  },
};
