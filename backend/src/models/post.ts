import { Schema, model, Document } from 'mongoose';

export interface PostType extends Document {
  body: string;
  author: string;
  amtLikes: number;
  amtComments: number;
}

const PostSchema = new Schema<PostType>({
  body: { type: String, required: true },
  author: { type: String, required: true },
  amtLikes: { type: Number, default: 0 },
  amtComments: { type: Number, default: 0 },
});

export const Post = model<PostType>('Post', PostSchema);
