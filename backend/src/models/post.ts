import { Schema, model, Document } from 'mongoose';

export interface PostType extends Document {
  body: string;
  author: string;
  amtLikes: number;
  amtComments: number;
  createdAt: Date;
}

const PostSchema = new Schema<PostType>({
  body: { type: String, required: true },
  author: { type: String, required: true },
  amtLikes: { type: Number, default: 0 },
  amtComments: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const Post = model<PostType>('Post', PostSchema);
