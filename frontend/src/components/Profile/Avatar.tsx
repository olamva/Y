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

  const handleLoad = () => {
    setIsLoaded(true);
  };

  useEffect(() => {
    setCurrentExtensionIndex(0);
    setHasImage(!!user.profilePicture);
    setIsLoaded(false);
  }, [user.profilePicture]);

  const sizeClasses = large ? "h-24 w-24 md:h-36 md:w-36" : "h-8 w-8";

  const FirstLetterAvatar = () => (
    <Tag
      {...tagProps}
      className={`flex select-none items-center justify-center rounded-full border border-neutral-400 bg-neutral-300 text-center text-gray-900 transition-transform ${
        disableHover ? "" : "hover:scale-105"
      } dark:border-neutral-700 dark:bg-neutral-900 dark:text-white ${sizeClasses}`}
      aria-label={`${user.username}'s profile`}
    >
      <p className={large ? "text-4xl md:text-7xl" : "text-base"}>
        {user.username && user.username.trim().length > 0
          ? user.username.charAt(0).toUpperCase()
          : "U"}
      </p>
    </Tag>
  );

  return (
    <figure>
      {hasImage && isLoaded ? (
        <Tag {...tagProps}>
          <img
            src={imageUrl}
            alt={`${user.username}'s profile`}
            className={`rounded-full object-cover ${sizeClasses} ${isLoaded ? "visible" : "invisible"}`}
            onError={handleError}
            onLoad={handleLoad}
            loading="lazy"
          />
        </Tag>
      ) : (
        <FirstLetterAvatar />
      )}
    </figure>
  );
};

export default Avatar;
