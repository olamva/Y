import { UserType } from "@/lib/types";
import { useState, useEffect } from "react";

interface AvatarProps {
  large?: boolean;
  noHref?: boolean;
  disableHover?: boolean;
  user: UserType;
}

const Avatar = ({
  large = false,
  disableHover = false,
  noHref = false,
  user,
}: AvatarProps) => {
  const Tag = noHref ? "div" : "a";
  const tagProps = noHref
    ? {}
    : { href: `/project2/user/${encodeURIComponent(user.username)}` };
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  const supportedExtensions = ["png", "jpg", "jpeg", "gif"];
  const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0);
  const [hasImage, setHasImage] = useState(true);
  const [isValidUsername, setIsValidUsername] = useState<boolean>(true);

  useEffect(() => {
    if (!user.username || user.username.trim() === "") {
      setIsValidUsername(false);
    } else {
      setIsValidUsername(true);
      setCurrentExtensionIndex(0);
      setHasImage(true);
    }
  }, [user.username]);

  const handleError = () => {
    if (currentExtensionIndex < supportedExtensions.length - 1) {
      setCurrentExtensionIndex(currentExtensionIndex + 1);
    } else {
      setHasImage(false);
    }
  };

  const imageUrl = `${BACKEND_URL}${user.profilePicture}.${supportedExtensions[currentExtensionIndex]}`;

  return (
    <figure>
      {isValidUsername && hasImage && user.profilePicture ? (
        <Tag {...tagProps}>
          <img
            src={imageUrl}
            alt={`${user.username}'s profile`}
            className={`rounded-full object-cover ${
              large ? "h-24 w-24 md:h-36 md:w-36" : "h-8 w-8"
            }`}
            onError={handleError}
            loading="lazy"
          />
        </Tag>
      ) : (
        <Tag
          {...tagProps}
          className={`flex select-none items-center justify-center rounded-full border border-neutral-400 bg-neutral-300 text-center text-gray-900 transition-transform ${
            disableHover ? "" : "hover:scale-105"
          } dark:border-neutral-700 dark:bg-neutral-900 dark:text-white ${
            large ? "h-24 w-24 md:h-36 md:w-36" : "h-8 w-8"
          }`}
          aria-label={`${isValidUsername ? user.username : "Default"}'s avatar`}
        >
          <p className={large ? "text-4xl md:text-7xl" : "text-base"}>
            {isValidUsername && user.username
              ? user.username.charAt(0).toUpperCase()
              : "U"}
          </p>
        </Tag>
      )}
    </figure>
  );
};

export default Avatar;
