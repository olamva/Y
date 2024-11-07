import { Document, Schema, model } from 'mongoose';

export interface CommentType extends Document {
  parentID: string;
  parentType: string;
  body: string;
  originalBody?: string;
  author: string;
  amtLikes: number;
  amtComments: number;
  createdAt: Date;
  imageUrl?: string;
}

const CommentSchema = new Schema<CommentType>({
  parentID: { type: String, required: true },
  parentType: { type: String, required: true, default: 'post' },
  body: { type: String, required: true },
  originalBody: { type: String, default: undefined },
  author: { type: String, required: true },
  amtLikes: { type: Number, default: 0 },
  amtComments: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  imageUrl: { type: String, default: undefined },
});

export const Comment = model<CommentType>('Comment', CommentSchema);
