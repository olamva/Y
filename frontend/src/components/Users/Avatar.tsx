import { UserType } from "@/lib/types";
import { MouseEvent, TouchEvent, useEffect, useState } from "react";

interface AvatarProps {
  large?: boolean;
  small?: boolean;
  noHref?: boolean;
  user: UserType;
}

const Avatar = ({
  large = false,
  small = false,
  noHref = false,
  user,
}: AvatarProps) => {
  const Tag = noHref ? "div" : "a";
  const tagProps = noHref
    ? {}
    : {
        href: `/project2/user/${encodeURIComponent(user.username)}`,
        onClick: (e: MouseEvent | TouchEvent) => e.stopPropagation(),
      };
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  const supportedExtensions = ["png", "jpg", "jpeg", "gif"];
  const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0);
  const [hasImage, setHasImage] = useState(!!user.profilePicture);
  const [isLoaded, setIsLoaded] = useState(false);
  const profilePictureHasExtension = /\.(png|jpg|jpeg|gif)$/.test(
    user.profilePicture || "",
  );

  const imageUrl = user.profilePicture
    ? profilePictureHasExtension
      ? `${BACKEND_URL}${user.profilePicture}`
      : `${BACKEND_URL}${user.profilePicture}.${supportedExtensions[currentExtensionIndex]}`
    : "";

  const handleError = () => {
    if (currentExtensionIndex < supportedExtensions.length - 1) {
      setCurrentExtensionIndex((prevIndex) => prevIndex + 1);
    } else {
      setHasImage(false);
    }
  };

  useEffect(() => {
    setCurrentExtensionIndex(0);
    setHasImage(!!user.profilePicture);
    setIsLoaded(false);
  }, [user.profilePicture]);

  const sizeClasses = large
    ? "size-24 md:size-36"
    : small
      ? "size-6"
      : "size-8";

  const FirstLetterAvatar = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <p
        className={
          large ? "text-4xl md:text-7xl" : small ? "text-xs" : "text-base"
        }
      >
        {user.username && user.username.trim().length > 0
          ? user.username.charAt(0).toUpperCase()
          : "U"}
      </p>
    </div>
  );

  const deterministicBgColor = () => {
    const colors = [
      "bg-blue-200 dark:bg-blue-900",
      "bg-red-200 dark:bg-red-900",
      "bg-indigo-200 dark:bg-indigo-900",
      "bg-purple-200 dark:bg-purple-900",
      "bg-pink-200 dark:bg-pink-900",
    ];
    const charCodeSum = user.username
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };

  return (
    <Tag
      {...tagProps}
      className={`relative flex select-none items-center justify-center overflow-hidden rounded-full border border-neutral-400 text-center text-gray-900 transition-transform dark:border-neutral-700 dark:text-white ${sizeClasses} ${hasImage && isLoaded ? "" : deterministicBgColor()}`}
      aria-label={`${user.username}'s profile`}
    >
      {hasImage && (
        <img
          src={imageUrl}
          alt={`${user.username}'s profile`}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onError={handleError}
          onLoad={() => {
            setIsLoaded(true);
          }}
          loading="lazy"
        />
      )}
      {!(hasImage && isLoaded) && <FirstLetterAvatar />}
    </Tag>
  );
};

export default Avatar;
