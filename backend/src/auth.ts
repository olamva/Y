// src/utils/auth.ts
import jwt from 'jsonwebtoken';
import { UserType } from './models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export const signToken = (user: UserType) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};
