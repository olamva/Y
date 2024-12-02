import toast from "react-hot-toast";

export const isFileAllowed = (file: File) => {
  const fileTypeWhitelist = ["image/png", "image/jpeg", "image/gif"];
  if (!fileTypeWhitelist.includes(file.type)) {
    toast.error("File type not supported");
    return false;
  }

  if (file.size > 1024 * 1024 * 5) {
    toast.error("File size must be less than 10MB");
    return false;
  }

  return true;
};
