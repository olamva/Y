import { IResolvers } from 'graphql-tools';
import { Post } from './models/post';
import { User } from './models/user';
import { Comment } from './models/comment';

export const resolvers: IResolvers = {
  Query: {
    getPosts: async () => {
      try {
        return await Post.find();
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
    async searchPosts(_: any, { query }: { query: string }) {
      return await Post.find({
        $or: [{ body: { $regex: query, $options: 'i' } }, { author: { $regex: query, $options: 'i' } }],
      });
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
    createUser: async (_, { username }) => {
      try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          throw new Error('Username already taken');
        }
        const newUser = new User({ username });
        return await newUser.save();
      } catch (err) {
        throw new Error(`Error creating user: ${(err as Error).message}`);
      }
    },

    createComment: async (_, { body, author, parentID }) => {
      try {
        const newComment = new Comment({ body, author, parentID: parentID });
        return await newComment.save();
      } catch (err) {
        throw new Error('Error creating comment');
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
  },
};
