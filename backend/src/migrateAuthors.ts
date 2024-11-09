import mongoose, { Types } from 'mongoose';
import dotenv from 'dotenv';
import { Post, PostType } from './models/post';
import { Comment, CommentType } from './models/comment';
import { User, UserType } from './models/user';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB for migration');

    try {
      // Migrate Posts
      const posts: PostType[] = await Post.find({}).exec();
      for (const post of posts) {
        if (typeof post.author === 'string') {
          const user = await User.findOne({ username: post.author });
          if (user) {
            post.author = user.id;
            await post.save();
            console.log(`Updated Post ID ${post._id} with User ID ${user._id}`);
          } else {
            console.warn(`User not found for Post ID ${post._id} with username ${post.author}`);
          }
        }
      }

      const comments: CommentType[] = await Comment.find({}).exec();
      for (const comment of comments) {
        if (typeof comment.author === 'string') {
          const user = await User.findOne({ username: comment.author });
          if (user) {
            comment.author = user.id;
            await comment.save();
            console.log(`Updated Comment ID ${comment._id} with User ID ${user._id}`);
          } else {
            console.warn(`User not found for Comment ID ${comment._id} with username ${comment.author}`);
          }
        }
      }

      console.log('Migration completed successfully');
    } catch (err) {
      console.error('Migration failed:', err);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
