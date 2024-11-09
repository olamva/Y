import { Document, Schema, model, Types } from 'mongoose';

export interface PostType extends Document {
  body: string;
  originalBody?: string;
  author: Types.ObjectId | string;
  amtLikes: number;
  amtComments: number;
  createdAt: Date;
  imageUrl?: string;
}

const PostSchema = new Schema<PostType>({
  body: { type: String, required: true },
  originalBody: { type: String, default: undefined },
  author: { type: Schema.Types.Mixed, ref: 'User', required: true },
  amtLikes: { type: Number, default: 0 },
  amtComments: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  imageUrl: { type: String, default: undefined },
});

export const Post = model<PostType>('Post', PostSchema);
