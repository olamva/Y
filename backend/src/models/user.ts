import bcrypt from 'bcrypt';
import { Document, Schema, Types, model } from 'mongoose';

export interface UserType extends Document {
  username: string;
  password: string;
  postIds: string[];
  likedPostIds: string[];
  likedCommentIds: string[];
  commentIds: string[];
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema = new Schema<UserType>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  postIds: { type: [String], default: [] },
  likedPostIds: { type: [String], default: [] },
  likedCommentIds: { type: [String], default: [] },
  followers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  commentIds: { type: [String], default: [] },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<UserType>('User', UserSchema);
