export const extractHashtags = (text: string): string[] => {
  const regex = /#(\w+)/g;
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
