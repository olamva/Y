import { Types } from 'mongoose';
import { User } from './models/user';

export const extractHashtags = (text: string): string[] => {
  const regex = /#([\wæøåÆØÅ]+)/g;
  const hashtags = new Set<string>();
  let match;

  while ((match = regex.exec(text)) !== null) {
    const tag = match[1].toLowerCase();
    if (tag.length <= 30) {
      hashtags.add(tag);
    }
  }

  return Array.from(hashtags);
};

export const extractMentions = async (text: string): Promise<Types.ObjectId[]> => {
  const regex = /@([\wæøåÆØÅ]+)/g;
  const mentions = new Set<Types.ObjectId>();
  let match;

  while ((match = regex.exec(text)) !== null) {
    const mention = match[1];
    if (mention.length <= 30) {
      const user = await User.findOne({ username: mention });
      if (user) {
        mentions.add(user.id);
      }
    }
  }

  return Array.from(mentions);
};
