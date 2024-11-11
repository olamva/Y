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

  const intervals: { [key: string]: number } = {
    month: 2592000,
    w: 604800,
    d: 86400,
    h: 3600,
    m: 60,
    s: 1,
  };

  if (secondsElapsed >= intervals.month) {
    return date.toLocaleDateString("no");
  }

  for (const key in intervals) {
    const interval = intervals[key];
    const count = Math.floor(secondsElapsed / interval);
    if (count >= 1) {
      return `${count}${key}`;
    }
  }

  return "Just now";
};
