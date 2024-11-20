import { Document, model, Schema, Types } from 'mongoose';

export interface notificationType extends Document {
  type: string;
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  createdAt: Date;
  postType: string;
  postID: Types.ObjectId;
}

const notificationSchema = new Schema<notificationType>({
  type: { type: String, required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  postType: { type: String, required: false },
  postID: { type: Schema.Types.ObjectId, ref: 'Post', required: false },
});

export const Notification = model<notificationType>('Notification', notificationSchema);
