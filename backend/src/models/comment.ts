import { Schema, model, Document } from 'mongoose';

export interface CommentType extends Document {
  parentID: string;
  body: string;
  author: string;
  amtLikes: number;
  amtComments: number;
}

const CommentSchema = new Schema<CommentType>({
  parentID: { type: String, required: true },
  body: { type: String, required: true },
  author: { type: String, required: true },
  amtLikes: { type: Number, default: 0 },
  amtComments: { type: Number, default: 0 },
});

export const Comment = model<CommentType>('Comment', CommentSchema);
