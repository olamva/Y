export const formatTimestamp = (timestamp: number | string): string => {
  const numTimestamp =
    typeof timestamp === "string" ? Number(timestamp) : timestamp;

  if (isNaN(numTimestamp)) {
    console.error(`Invalid timestamp: "${timestamp}" is not a number.`);
    return "Invalid Timestamp";
  }

  const date = new Date(numTimestamp);
  if (isNaN(date.getTime())) {
    console.error(
      `Invalid Date: The timestamp "${numTimestamp}" does not correspond to a valid date.`,
    );
    return "Invalid Date";
  }

  const now = new Date();
  const secondsElapsed = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (secondsElapsed < 0) {
    return "In the future";
  }

  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const key in intervals) {
    const interval = intervals[key];
    const count = Math.floor(secondsElapsed / interval);
    if (count >= 1) {
      return count === 1 ? `1 ${key} ago` : `${count} ${key}s ago`;
    }
  }

  return "Just now";
};
