import { Document, Schema, model } from 'mongoose';

export interface PostType extends Document {
  body: string;
  originalBody?: string;
  author: string;
  amtLikes: number;
  amtComments: number;
  createdAt: Date;
  imageUrl?: string;
}

const PostSchema = new Schema<PostType>({
  body: { type: String, required: true },
  originalBody: { type: String, default: undefined },
  author: { type: String, required: true },
  amtLikes: { type: Number, default: 0 },
  amtComments: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  imageUrl: { type: String, default: undefined },
});

export const Post = model<PostType>('Post', PostSchema);
