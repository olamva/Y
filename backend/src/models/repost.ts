import { Document, model, Schema, Types } from 'mongoose';

export interface RepostType extends Document {
  author: Types.ObjectId;
  originalID: Types.ObjectId;
  originalType: string;
  repostedAt: Date;
}

const repostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  originalID: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  originalType: { type: String, required: true },
  repostedAt: { type: Date, default: Date.now },
});

export const Repost = model<RepostType>('Repost', repostSchema);
