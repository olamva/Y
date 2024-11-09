import { Document, Schema, model, Types } from 'mongoose';

export interface CommentType extends Document {
  parentID: string;
  parentType: string;
  body: string;
  originalBody?: string;
  author: Types.ObjectId | string;
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
  author: { type: Schema.Types.Mixed, ref: 'User', required: true },
  amtLikes: { type: Number, default: 0 },
  amtComments: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  imageUrl: { type: String, default: undefined },
});

export const Comment = model<CommentType>('Comment', CommentSchema);
