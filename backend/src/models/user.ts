import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface UserType extends Document {
  username: string;
  password: string;
  postIds: string[];
  likedPostIds: string[];
  commentIds: string[];
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema = new Schema<UserType>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  postIds: { type: [String], default: [] },
  likedPostIds: { type: [String], default: [] },
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
