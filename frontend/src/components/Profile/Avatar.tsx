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
  const [cacheBuster, setCacheBuster] = useState<string>("");

  const profilePictureHasExtension = /\.(png|jpg|jpeg|gif)$/.test(
    user.profilePicture || "",
  );

  const generateCacheBuster = () => {
    return `cb=${new Date().getTime()}`;
  };

  const imageUrl = user.profilePicture
    ? profilePictureHasExtension
      ? `${BACKEND_URL}${user.profilePicture}?${cacheBuster}`
      : `${BACKEND_URL}${user.profilePicture}.${supportedExtensions[currentExtensionIndex]}?${cacheBuster}`
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
    setCacheBuster(generateCacheBuster());
  }, [user.profilePicture]);

  const sizeClasses = large ? "h-24 w-24 md:h-36 md:w-36" : "h-8 w-8";

  const containerClasses = `relative flex select-none items-center justify-center rounded-full border border-neutral-400 bg-neutral-300 text-center text-gray-900 transition-transform ${
    disableHover ? "" : "hover:scale-105"
  } dark:border-neutral-700 dark:bg-neutral-900 dark:text-white ${sizeClasses} overflow-hidden`;

  const FirstLetterAvatar = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <p className={large ? "text-4xl md:text-7xl" : "text-base"}>
        {user.username && user.username.trim().length > 0
          ? user.username.charAt(0).toUpperCase()
          : "U"}
      </p>
    </div>
  );

  return (
    <Tag
      {...tagProps}
      className={containerClasses}
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
          onLoad={handleLoad}
          loading="lazy"
        />
      )}
      {hasImage && !isLoaded && <FirstLetterAvatar />}
      {!hasImage && <FirstLetterAvatar />}
    </Tag>
  );
};

export default Avatar;
