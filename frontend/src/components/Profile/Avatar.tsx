import { UserType } from "@/lib/types";

interface AvatarProps {
  large?: boolean;
  noHref?: boolean;
  disableHover?: boolean;
  user?: UserType;
  username?: string;
}

const Avatar = ({
  user,
  large = false,
  disableHover = false,
  noHref = false,
  username,
}: AvatarProps) => {
  const resolvedUsername = user?.username || username || "U";
  const Tag = noHref ? "div" : "a";
  const tagProps = noHref ? {} : { href: `/project2/user/${resolvedUsername}` };
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  return (
    <figure>
      {user?.profilePicture ? (
        <img
          src={`${BACKEND_URL}${user.profilePicture}`}
          alt={`${resolvedUsername}'s profile`}
          className={`rounded-full ${large ? "size-24 md:size-36" : "size-8"}`}
        />
      ) : (
        <Tag
          {...tagProps}
          className={`flex select-none items-center justify-center rounded-full border border-neutral-400 bg-neutral-300 text-center text-gray-900 transition-all ${
            disableHover ? "" : "hover:scale-105"
          } dark:border-neutral-700 dark:bg-neutral-900 dark:text-white ${
            large ? "size-24 md:size-36" : "size-8"
          }`}
        >
          <p className={large ? "text-4xl md:text-7xl" : ""}>
            {resolvedUsername[0].toUpperCase()}
          </p>
        </Tag>
      )}
    </figure>
  );
};

export default Avatar;
