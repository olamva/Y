import { useQuery } from "@apollo/client"; // Ensure you have Apollo Client set up
import { UserType } from "@/lib/types";
import { GET_USER_QUERY } from "@/queries/user";

interface AvatarProps {
  large?: boolean;
  noHref?: boolean;
  disableHover?: boolean;
  user?: UserType;
  username?: string;
}

const Avatar = ({
  user: propUser,
  large = false,
  disableHover = false,
  noHref = false,
  username,
}: AvatarProps) => {
  const { data, loading, error } = useQuery(GET_USER_QUERY, {
    variables: { username },
    skip: !!propUser || !username,
  });

  const fetchedUser: UserType | undefined = data?.getUser;
  const user = propUser || fetchedUser;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.error("Error fetching user:", error);
    return <div>Error loading avatar</div>;
  }

  if (!user) {
    return (
      <div
        className={`flex select-none items-center justify-center rounded-full border border-neutral-400 bg-neutral-300 text-center text-gray-900 transition-all ${
          disableHover ? "" : "hover:scale-105"
        } dark:border-neutral-700 dark:bg-neutral-900 dark:text-white ${
          large ? "size-24 md:size-36" : "size-8"
        }`}
      >
        <p className={large ? "text-4xl md:text-7xl" : ""}>?</p>
      </div>
    );
  }

  const resolvedUsername = user.username;
  const Tag = noHref ? "div" : "a";
  const tagProps = noHref ? {} : { href: `/project2/user/${resolvedUsername}` };
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  return (
    <figure>
      {user.profilePicture ? (
        <Tag {...tagProps}>
          <img
            src={`${BACKEND_URL}${user.profilePicture}`}
            alt={`${resolvedUsername}'s profile`}
            className={`rounded-full ${large ? "size-24 md:size-36" : "size-8"}`}
          />
        </Tag>
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
