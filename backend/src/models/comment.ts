import { Document, model, Schema, Types } from 'mongoose';

export interface CommentType extends Document {
  parentID: string;
  parentType: string;
  body?: string;
  originalBody?: string;
  author: Types.ObjectId;
  amtLikes: number;
  amtComments: number;
  amtReposts: number;
  createdAt: Date;
  imageUrl?: string;
  hashTags?: string[];
  mentionedUsers?: Types.ObjectId[];
}

const CommentSchema = new Schema<CommentType>({
  parentID: { type: String, required: true },
  parentType: { type: String, required: true, default: 'post' },
  body: { type: String, default: undefined },
  originalBody: { type: String, default: undefined },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amtLikes: { type: Number, default: 0 },
  amtComments: { type: Number, default: 0 },
  amtReposts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  imageUrl: { type: String, default: undefined },
  hashTags: { type: [String], default: undefined, index: true },
  mentionedUsers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
});

export const Comment = model<CommentType>('Comment', CommentSchema);
