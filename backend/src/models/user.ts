import { Schema, model, Document } from 'mongoose';

export interface UserType extends Document {
  username: string;
  password: string;
  postIds: string[];
  likedPostIds: string[];
  commentIds: string[];
}

const UserSchema = new Schema<UserType>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  postIds: { type: [String], default: [] },
  likedPostIds: { type: [String], default: [] },
  commentIds: { type: [String], default: [] },
});

export const User = model<UserType>('User', UserSchema);
