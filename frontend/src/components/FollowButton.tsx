import { useAuth } from "@/components/AuthContext";
import {
  FOLLOW_USER_MUTATION,
  GET_USER_QUERY,
  UNFOLLOW_USER_MUTATION,
} from "@/queries/user";
import { useMutation } from "@apollo/client";
import { Check, UserPlus, X } from "lucide-react";
import { MouseEvent, useState } from "react";
import toast from "react-hot-toast";

interface FollowButtonProps {
  targetUsername: string;
  darker?: boolean;
}

const FollowButton = ({ targetUsername, darker }: FollowButtonProps) => {
  const { user, refetchUser, following, setFollowing } = useAuth();
  const [isHovering, setIsHovering] = useState(false);

  const [followUserMutation] = useMutation(FOLLOW_USER_MUTATION, {
    variables: { username: targetUsername },
    refetchQueries: [
      { query: GET_USER_QUERY, variables: { username: targetUsername } },
    ],
    onCompleted: () => {
      setFollowing([...following, targetUsername]);
      toast.success(`You are now following ${targetUsername}`);
      refetchUser();
    },
    onError: (error) => {
      toast.error(`Error following user: ${(error as Error).message}`);
    },
  });

  const [unfollowUserMutation] = useMutation(UNFOLLOW_USER_MUTATION, {
    variables: { username: targetUsername },
    refetchQueries: [
      { query: GET_USER_QUERY, variables: { username: targetUsername } },
    ],
    onCompleted: () => {
      setFollowing(following.filter((u) => u !== targetUsername));
      toast.success(`You have unfollowed ${targetUsername}`);
      refetchUser();
    },
    onError: (error) => {
      toast.error(`Error unfollowing user: ${(error as Error).message}`);
    },
  });

  const handleFollow = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    try {
      await followUserMutation();
    } catch (error) {
      toast.error(`Error following user: ${(error as Error).message}`);
    }
  };

  const handleUnfollow = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    try {
      await unfollowUserMutation();
    } catch (error) {
      toast.error(`Error unfollowing user: ${(error as Error).message}`);
    }
  };

  const isFollowing = following.includes(targetUsername);

  const displayButton = user ? user.username !== targetUsername : true;

  return (
    displayButton && (
      <button
        role="button"
        className="inline-flex cursor-pointer select-none items-center p-1"
        tabIndex={0}
        aria-pressed={isFollowing}
        aria-label={
          isFollowing ? (isHovering ? "Unfollow" : "Following") : "Follow"
        }
        onClick={(e) => {
          if (isFollowing) {
            handleUnfollow(e);
          } else {
            handleFollow(e);
            setIsHovering(false);
          }
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {!isFollowing ? (
          <div className="group flex items-center">
            <UserPlus className="mr-1 h-4 w-4 text-blue-700 group-hover:text-blue-800 dark:text-blue-400 group-hover:dark:text-blue-600" />
            <span className="hidden text-sm font-medium text-blue-700 group-hover:text-blue-800 dark:text-blue-400 group-hover:dark:text-blue-600 sm:flex">
              Follow
            </span>
          </div>
        ) : isHovering ? (
          <>
            <X className="mr-1 h-4 w-4 text-red-600 dark:text-red-500" />
            <span className="hidden text-sm font-medium text-red-600 dark:text-red-500 sm:flex">
              Unfollow
            </span>
          </>
        ) : (
          <div className="group flex items-center">
            <Check
              className={`mr-1 h-4 w-4 ${darker ? "text-green-800 dark:text-green-500" : "text-green-700 dark:text-green-500"}`}
            />
            <span
              className={`hidden text-sm font-medium ${darker ? "text-green-800 dark:text-green-500" : "text-green-700 dark:text-green-500"} sm:flex`}
            >
              Following
            </span>
          </div>
        )}
      </button>
    )
  );
};

export default FollowButton;
