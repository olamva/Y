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

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${day}. ${monthNames[monthIndex]} ${year}`;
};
